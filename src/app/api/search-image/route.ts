import { NextResponse } from "next/server";

const imageCache = new Map<string, string>()

export const POST = async (req: Request) => {
    const body = await req.json();
    const query = body.query || "Eiffel Tower?";

    const exists = imageCache.get(query)

    if (exists) return NextResponse.json({ 
        imageUrl: exists
    })

    try {
        const response = await fetch('https://google.serper.dev/images', {
            method: 'POST',
            headers: {
                'X-API-KEY': process.env.SERPER_API_KEY || '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ q: query }),
        });

        if (!response.ok) {
            console.error(`Image search failed for "${query}":`, response.statusText);
            return NextResponse.json({ error: 'Image search failed' }, { status: 500 });
        }

        const data = await response.json();

        if (data.images && data.images.length > 0) {
            const imageUrl = data.images[0].imageUrl;
            imageCache.set(query, imageUrl)
            return NextResponse.json({ imageUrl } );
        }

        return NextResponse.json({ error: 'No images found' }, { status: 404 });
    } catch (error) {
        console.error(`Error searching image for "${query}":`, error);
        return NextResponse.json({ error: 'Image search failed' }, { status: 500 });
    }
}