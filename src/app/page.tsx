import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-white min-h-screen w-screen">
      <div className="max-w-3xl mx-auto flex flex-col space-y-10 mt-10 pb-40">
        <p className="text-black/50 text-sm font-[450]">Hello!!</p>
        <div className="flex flex-row space-x-2 -translate-x-6">
          <Avatar className="size-6 mt-4">
            <div className="bg-linear-to-br from-pink-500 to-yellow-500 h-8 w-8 rounded-full"></div>
          </Avatar>
          <Card>
            <CardContent className="text-gray-600 text-sm font-[450]">
              <p>Hello, how may I help you today?</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-black/50 text-sm font-[450]">What is kimi k2</p>
        <div className="flex flex-row space-x-2 -translate-x-6">
          <Avatar className="size-6 mt-4">
            <div className="bg-linear-to-br from-pink-500 to-yellow-500 h-8 w-8 rounded-full"></div>
          </Avatar>
          <Card>
            <CardContent className="text-gray-600 text-sm font-[450]">
              <p>Kimi K2 is an LLM that was released by Ollama in 2025. It was made to work originally with vulkan but now it works with cuda. Do you want to learn more?</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 max-w-[802px] mx-auto">
        <div className="absolute bottom-full left-0 right-0 h-8 bg-linear-to-t from-white to-transparent pointer-events-none"></div>
        
        <div className="relative bg-white pt-1 pb-8">
          <Textarea rows={2} className="resize-none text-sm bg-gray-50" placeholder="Type your message here..." />
          <button className="absolute right-2 top-[30px] -translate-y-1/2 bg-linear-to-br from-pink-500 to-yellow-500 text-white placeholder:text-gray-100 p-2 rounded-full text-sm font-medium shadow-sm hover:opacity-90 transition duration-200 cursor-pointer">
            <ArrowUp size={15}/>
          </button>
        </div>
      </div>
    </div>
  );
}
