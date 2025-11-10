"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp } from "lucide-react";
import { UIRenderer, ResponseRoot } from "@/components/llm-components";
import { ModelSelector } from "@/components/ModelSelector";
import { ClientLayout } from "@/components/ClientLayout";
import { ModeToggle } from "@/components/ModeToggle";
import { getProviderSettings } from "@/lib/settingsStore";
import { useToast } from "@/hooks/useToast";
import {
  loadChatTabs,
  saveChatTabs,
  loadActiveTabId,
  saveActiveTabId,
  createNewTab,
  updateTab,
  deleteTab,
  generateTabTitle,
  ChatTab,
  Message,
} from "@/lib/chatStorage";

export default function Home() {
  const [tabs, setTabs] = useState<ChatTab[]>([]);
  const [activeTabId, setActiveTabId] = useState("");
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingResponse, setCurrentStreamingResponse] =
    useState<ResponseRoot | null>(null);
  const [currentStreamingText, setCurrentStreamingText] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [selectedModel, setSelectedModel] = useState("");
  const [mode, setMode] = useState<'ask' | 'agent'>('ask');
  const { showToast, ToastContainer } = useToast();
  const [providerChecked, setProviderChecked] = useState(false);

  const handleProviderError = (provider: string, error: string) => {
    if (!providerChecked) {
      showToast(error, "error");
      setProviderChecked(true);
    }
  };

  // Load tabs from localStorage on mount
  useEffect(() => {
    const loadedTabs = loadChatTabs();
    const loadedActiveTabId = loadActiveTabId();

    if (loadedTabs.length > 0) {
      setTabs(loadedTabs);
      // Set active tab if it exists, otherwise use first tab
      if (loadedActiveTabId && loadedTabs.some(tab => tab.id === loadedActiveTabId)) {
        setActiveTabId(loadedActiveTabId);
      } else {
        setActiveTabId(loadedTabs[0].id);
      }
    }
    // Don't create a tab automatically - let user create one when they start chatting
  }, []);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    if (tabs.length > 0) {
      saveChatTabs(tabs);
    }
  }, [tabs]);

  // Save active tab ID whenever it changes
  useEffect(() => {
    if (activeTabId) {
      saveActiveTabId(activeTabId);
    }
  }, [activeTabId]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const messages = activeTab?.messages || [];
  const hasMessages = messages.length > 0;
  const hasNoTabs = tabs.length === 0;

  const updateTabMessages = (tabId: string, newMessages: Message[]) => {
    setTabs((prev) => updateTab(prev, tabId, { messages: newMessages }));
  };

  const updateTabTitle = (tabId: string, title: string) => {
    setTabs((prev) => updateTab(prev, tabId, { title }));
  };

  const updateTabTitleFromMessage = (tabId: string, firstMessage: string) => {
    const title = generateTabTitle(firstMessage);
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, title } : tab))
    );
  };

  const handleNewTab = () => {
    const newTab = createNewTab();
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleDeleteTab = (tabId: string) => {
    const remainingTabs = deleteTab(tabs, tabId);
    setTabs(remainingTabs);
    
    // If deleting active tab, switch to another tab or create new one
    if (tabId === activeTabId) {
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[0].id);
      } else {
        // Create a new tab if all tabs are deleted
        const newTab = createNewTab();
        setTabs([newTab]);
        setActiveTabId(newTab.id);
      }
    }
  };

  const streamResponse = async (userMessage: string, tabId: string, currentMessages: Message[]) => {
    setIsStreaming(true);
    setCurrentStreamingResponse(null);
    setCurrentStreamingText("");

    let latestResponse: ResponseRoot | null = null;
    let textResponse = "";

    const apiMessages = currentMessages.map((msg) => ({
      role: msg.role,
      content:
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content),
    }));

    apiMessages.push({
      role: "user",
      content: userMessage,
    });

    try {
      const providerSettings = getProviderSettings();
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messages: apiMessages,
          model: selectedModel,
          mode: mode,
          provider: providerSettings.provider,
          apiKey: providerSettings.openaiApiKey,
          baseUrl: providerSettings.ollamaBaseUrl,
          serperApiKey: providerSettings.serperApiKey
        }),
      });

      if (!response.ok) {
        const providerName = providerSettings.provider === 'openai' ? 'OpenAI' : 'Ollama';
        if (response.status === 500) {
          const errorText = await response.text();
          showToast(`${providerName} not connected`, "error");
        } else if (response.status === 401) {
          showToast(`${providerName} authentication failed`, "error");
        } else {
          showToast(`${providerName} error: ${response.status}`, "error");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              if (mode === 'ask' && textResponse) {
                updateTabMessages(tabId, [
                  ...currentMessages,
                  {
                    role: "assistant",
                    content: textResponse,
                  },
                ]);
              } else if (mode === 'agent' && latestResponse) {
                const finalResponse: ResponseRoot = latestResponse;
                updateTabMessages(tabId, [
                  ...currentMessages,
                  {
                    role: "assistant",
                    content: finalResponse,
                  },
                ]);
              }
              setCurrentStreamingResponse(null);
              setIsStreaming(false);
              setFormValues({});
              return;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (mode === 'ask' && parsed.type === 'text') {
                // Handle text streaming for Ask mode
                textResponse += parsed.content;
                setCurrentStreamingText(textResponse);
              } else if (mode === 'agent') {
                // Handle JSON streaming for Agent mode
                latestResponse = parsed as ResponseRoot;
                setCurrentStreamingResponse(parsed);
              }
            } catch (e) {
              console.error("Failed to parse JSON:", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);
      const providerSettings = getProviderSettings();
      const providerName = providerSettings.provider === 'openai' ? 'OpenAI' : 'Ollama';
      
      // Check if it's a network error
      if (err instanceof TypeError && err.message.includes('fetch')) {
        showToast(`${providerName} not reachable`, "error");
      } else {
        showToast(`Connection to ${providerName} failed`, "error");
      }
      
      updateTabMessages(tabId, [
        ...currentMessages,
        {
          role: "assistant",
          content: "Sorry, an error occurred while processing your request.",
        },
      ]);
      setIsStreaming(false);
      setCurrentStreamingResponse(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");

    // Create first tab if none exists
    if (tabs.length === 0) {
      const newTab = createNewTab();
      const title = generateTabTitle(userMessage);
      const userMsg: Message = { role: "user", content: userMessage };
      const tabWithMessage = { ...newTab, title, messages: [userMsg] };
      setTabs([tabWithMessage]);
      setActiveTabId(newTab.id);
      await streamResponse(userMessage, newTab.id, [userMsg]);
      return;
    }

    // Update tab title with first message
    if (messages.length === 0) {
      updateTabTitleFromMessage(activeTabId, userMessage);
    }

    const updatedMessages: Message[] = [...messages, { role: "user" as const, content: userMessage }];
    updateTabMessages(activeTabId, updatedMessages);
    await streamResponse(userMessage, activeTabId, updatedMessages);
  };

  const handleButtonAction = async (action: string, label: string) => {
    if (isStreaming) return;

    let actionMessage = `User clicked button: "${label}"`;

    if (Object.keys(formValues).length > 0) {
      actionMessage +=
        "\n\nForm data:\n" +
        Object.entries(formValues)
          .map(([key, value]) => `- ${key}: ${value}`)
          .join("\n");
    }

    const updatedMessages: Message[] = [...messages, { role: "user" as const, content: actionMessage }];
    updateTabMessages(activeTabId, updatedMessages);
    await streamResponse(actionMessage, activeTabId, updatedMessages);
  };

  const handleFormChange = (id: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <ToastContainer />
      <ClientLayout
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={setActiveTabId}
        onNewTab={handleNewTab}
        onDeleteTab={handleDeleteTab}
      >
        <div className="bg-white w-full h-[calc(100vh-40px)] flex flex-col relative">
      {!hasMessages || hasNoTabs ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[802px] px-4 md:px-0">
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
              <Textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                className="w-full resize-none text-sm bg-transparent border-0 shadow-none py-0 px-0 placeholder:font-[490] placeholder:text-gray-400 text-gray-700 max-h-32 overflow-y-auto leading-relaxed"
                placeholder="Ask anything..."
              />
              <div className="flex items-center justify-between gap-2 mt-3">
                <ModeToggle mode={mode} onChange={setMode} />
                <div className="flex items-center gap-2">
                <ModelSelector 
                  value={selectedModel} 
                  onChange={setSelectedModel}
                  onProviderError={handleProviderError}
                />
                <button
                  onClick={handleSend}
                  disabled={isStreaming || !input.trim()}
                  className="bg-gradient-to-br from-pink-500 to-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:opacity-90 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>Send</span>
                  <ArrowUp size={14} />
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto flex flex-col space-y-6 md:space-y-10 mt-6 md:mt-10 pb-32 md:pb-40 px-4 md:px-0">
        {messages.map((message, index) => (
          <div key={index}>
            {message.role === "user" ? (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-pink-500 to-yellow-500 text-white px-4 py-2.5 rounded-2xl max-w-[80%] shadow-sm">
                  <p className="text-sm font-[450] leading-relaxed">
                    {message.content as string}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-row space-x-2 md:-translate-x-6">
                <Avatar className="size-6 mt-4 shrink-0">
                  <div className="bg-linear-to-br from-pink-500 to-yellow-500 h-8 w-8 rounded-full"></div>
                </Avatar>
                <Card className="flex-1 shadow-none bg-gray-50 border-gray-200 min-w-0">
                  <CardContent className="text-gray-600 text-sm font-[450] px-3 md:px-5">
                    {typeof message.content === "string" ? (
                      <p className="leading-relaxed">{message.content}</p>
                    ) : (
                      <div className="space-y-4">
                        {message.content.children?.map((child, childIndex) => (
                          <UIRenderer
                            key={childIndex}
                            component={child}
                            onAction={handleButtonAction}
                            formValues={formValues}
                            onFormChange={handleFormChange}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ))}

        {isStreaming && (mode === 'ask' ? currentStreamingText : currentStreamingResponse) && (
          <div className="flex flex-row space-x-2 md:-translate-x-6">
            <Avatar className="size-6 mt-4 shrink-0">
              <div className="bg-linear-to-br from-pink-500 to-yellow-500 h-8 w-8 rounded-full"></div>
            </Avatar>
            <Card className="flex-1 shadow-none bg-gray-50 border-gray-200 min-w-0">
              <CardContent className="text-gray-600 text-sm font-[450] px-3 md:px-5">
                {mode === 'ask' ? (
                  <p className="leading-relaxed">{currentStreamingText}</p>
                ) : (
                  <div className="space-y-4">
                    {currentStreamingResponse?.children?.map((child, index) => (
                      <UIRenderer
                        key={index}
                        component={child}
                        onAction={handleButtonAction}
                        formValues={formValues}
                        onFormChange={handleFormChange}
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400 text-xs mt-4">
                  <div className="animate-spin h-3 w-3 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                  <span>Streaming...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 max-w-[802px] mx-auto px-4 md:px-0">
            <div className="absolute bottom-full left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            <div className="bg-white pt-1 pb-6 md:pb-8">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                <Textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isStreaming}
                  className="w-full resize-none text-sm bg-transparent border-0 shadow-none py-0 px-0 placeholder:font-[490] placeholder:text-gray-400 text-gray-700 max-h-32 overflow-y-auto leading-relaxed"
                  placeholder="Ask anything..."
                />
                <div className="flex items-center justify-between gap-2 mt-3">
                  <ModeToggle mode={mode} onChange={setMode} />
                  <div className="flex items-center gap-2">
                  <ModelSelector 
                    value={selectedModel} 
                    onChange={setSelectedModel}
                    onProviderError={handleProviderError}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isStreaming || !input.trim()}
                    className="bg-gradient-to-br from-pink-500 to-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:opacity-90 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Send</span>
                    <ArrowUp size={14} />
                  </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
        </div>
      </ClientLayout>
    </>
  );
}
