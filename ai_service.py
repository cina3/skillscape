import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI, APIError

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_API_BASE") 
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_MODELS = {
    "google/gemini-2.0-flash-exp:free",
    "deepseek/deepseek-r1:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "qwen/qwen3-235b-a22b:free", 
    "meta-llama/llama-4-maverick:free"
}

class ChatReq(BaseModel):
    prompt: str
    model: str = "google/gemini-2.0-flash-exp:free"
    system_prompt: Optional[str] = (
        "You are an assistant helping users enhance their order requests for a freelancer service. "
        "You have two tools: Enhanced Text Response and Template File. "
        "1. Enhanced Text Response: Use the EXACT format <EXPL>Your enhanced text here</EXPL> to provide detailed order requests or requirements. "
        "2. Template File: Use the EXACT format <FILE>filename.ext</FILE> to suggest template files. Valid extensions: .txt, .pdf, .js, .java, .cpp, .py, .html, .css. "
        "You can use up to 5 <FILE> tags. "
        "You MUST use these exact tag formats. Do not use variations like <FILE_NAME> or miss closing tags. "
        "The content within <EXPL> and <FILE> tags will be processed by the system and will NOT be directly shown to the user in the chat message itself. "
        
        "CRITICAL INSTRUCTIONS FOR YOUR RESPONSE STYLE:\n"
        "1.  NO MARKDOWN: Absolutely DO NOT use any Markdown styling (like `**bold**`, `*italic*`, `_underline_`, or lists starting with `-`, `+`, or `*`) in ANY part of your response, including text inside `<EXPL>` tags and your conversational messages. ALL text must be plain. Newlines are acceptable.\n"
        "2.  CONVERSATIONAL SUMMARY: AFTER using `<EXPL>` or `<FILE>` tags, ALWAYS provide a brief, friendly, plain text message to the user summarizing what you did. For example: 'I've drafted the project details for you.' or 'Here are some template files that might be useful.' or 'Okay, I've updated the requirements and suggested a file.' This summary should be outside the special tags.\n"
        "3.  NEWLINES IN EXPL: Inside the `<EXPL>` tag, use standard newline characters (`\\n`) for line breaks. The frontend will handle converting these to display correctly.\n"
        
        "Focus on the task. You can use both <EXPL> and <FILE> tags in the same response."
    )

class ChatRes(BaseModel):
    reply: str

@app.get("/")
async def root():
    """Health check endpoint that can be used to verify server is running."""
    return JSONResponse(
        content={
            "status": "ok",
            "message": "AI service is running",
            "version": "1.0"
        }
    )

@app.get("/test")
async def test():
    """Test endpoint that returns a simple response."""
    return JSONResponse(
        content={
            "reply": "This is a test response from the AI service."
        }
    )

@app.post("/chat", response_model=ChatRes)
async def chat(req: ChatReq):
    if req.model not in ALLOWED_MODELS:
        raise HTTPException(
            400,
            f"Unsupported model '{req.model}'. Choose from: {', '.join(ALLOWED_MODELS)}"
        )

    messages = [
        {"role": "system", "content": req.system_prompt},
        {"role": "user",   "content": req.prompt}
    ]

    try:
        resp = client.chat.completions.create(
            model=req.model,
            messages=messages
        )
    except Exception as e:
        raise HTTPException(502, f"Chat call failed: {e}")

    if not getattr(resp, "choices", None):
        raise HTTPException(502, f"No choices returned. Raw: {resp}")

    choice = resp.choices[0]
    reply = (
        getattr(getattr(choice, "message", {}), "content", None)
        or getattr(choice, "text", None)
    )
    if not reply:
        raise HTTPException(502, f"Could not extract reply. Raw choice: {choice}")

    return ChatRes(reply=reply)

@app.post("/chat/stream")
async def chat_stream(req: ChatReq):
    if req.model not in ALLOWED_MODELS:
        raise HTTPException(
            400,
            f"Unsupported model '{req.model}'. Choose from: {', '.join(ALLOWED_MODELS)}"
        )

    messages = [
        {"role": "system", "content": req.system_prompt},
        {"role": "user",   "content": req.prompt}
    ]

    def event_generator():
        try:
            stream = client.chat.completions.create(
                model=req.model,
                messages=messages,
                stream=True
            )
            for chunk in stream:
                delta = chunk.choices[0].delta
                token = getattr(delta, "content", None)
                if token:
                    yield f"data: {token}\n\n"
        except APIError as e:
            yield f"event: error\ndata: Provider error: {e}\n\n"
        except Exception as e:
            yield f"event: error\ndata: Unexpected error: {e}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    print("Starting AI service on port 5000...")
    uvicorn.run(app, host="0.0.0.0", port=5000)
