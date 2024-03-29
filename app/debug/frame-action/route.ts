import { getFrame } from "frames.js";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const isPostRedirect =
    req.nextUrl.searchParams.get("postType") === "post_redirect";

  try {
    const url = body.untrustedData.url;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      redirect: isPostRedirect ? "manual" : undefined,
      body: JSON.stringify(body),
    });

    if (r.status === 302) {
      return Response.json(
        {
          location: r.headers.get("location"),
        },
        { status: 302 }
      );
    }

    const htmlString = await r.text();

    const frame = getFrame({ htmlString, url });

    if (!frame) {
      return new Response("Invalid frame", { status: 400 });
    }

    return Response.json(frame);
  } catch (err) {
    console.error(err);
    return Response.error();
  }
}
