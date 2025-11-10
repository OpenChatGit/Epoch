import { searchImage } from "@/lib/searchUtils";
import { NextResponse } from "next/server";

const imageCache = new Map<string, string>();

export const POST = async (req: Request) => {
  const body = await req.json();
  const query = body.query || "Eiffel Tower?";
  const apiKey = body.apiKey || process.env.SERPER_API_KEY;

  // Check if API key is provided
  if (!apiKey) {
    return NextResponse.json(
      { error: "Serper API key not configured. Please add it in Settings → Web Search." },
      { status: 400 }
    );
  }

  const exists = imageCache.get(query);

  if (exists)
    return NextResponse.json({
      imageUrl: exists,
    });

  try {
    const image = await searchImage(query, apiKey);
    imageCache.set(query, image);

    // Return success with tracking flag
    return NextResponse.json({ 
      imageUrl: image,
      tracked: true // Signal to client to track usage
    });
  } catch (error) {
    console.error(`Error searching image for "${query}":`, error);
    const errorMessage = error instanceof Error ? error.message : "Image search failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
