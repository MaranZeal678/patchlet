"""Thin wrappers around the Mistral chat completions API."""

from __future__ import annotations

import json
from typing import Any

from mistralai.client.sdk import Mistral

import config

_client: Mistral | None = None


def client() -> Mistral:
    global _client
    if _client is None:
        _client = Mistral(api_key=config.mistral_api_key())
    return _client


def _text(content: Any) -> str:
    """`content` is a string for most models and a list of typed chunks for reasoning models."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for chunk in content:
            chunk_type = getattr(chunk, "type", None) or (chunk.get("type") if isinstance(chunk, dict) else None)
            if chunk_type == "text":
                parts.append(getattr(chunk, "text", None) or chunk.get("text", ""))
        return "".join(parts)
    return str(content or "")


def complete(model: str, system: str, user: str, temperature: float = 0.2, max_tokens: int = 16000) -> str:
    response = client().chat.complete(
        model=model,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return _text(response.choices[0].message.content)


def complete_json(model: str, system: str, user: str, schema_name: str, schema: dict[str, Any]) -> dict[str, Any]:
    response = client().chat.complete(
        model=model,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        temperature=0.1,
        response_format={
            "type": "json_schema",
            "json_schema": {"name": schema_name, "schema": schema, "strict": True},
        },
    )
    return json.loads(_text(response.choices[0].message.content))


def function_call(model: str, system: str, user: str, tools: list[dict[str, Any]], tool_name: str) -> dict[str, Any]:
    """Ask the model to call one function tool and return the arguments it chose."""
    response = client().chat.complete(
        model=model,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        tools=tools,
        tool_choice="any",
        temperature=0.0,
        top_p=1.0,
    )
    message = response.choices[0].message
    calls = getattr(message, "tool_calls", None) or []
    for call in calls:
        function = getattr(call, "function", None)
        if function is not None and getattr(function, "name", "") == tool_name:
            arguments = function.arguments
            return json.loads(arguments) if isinstance(arguments, str) else dict(arguments)
    raise RuntimeError(f"model did not call {tool_name}")
