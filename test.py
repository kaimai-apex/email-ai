from openai import OpenAI

oai_client = OpenAI(
    api_key="sk-goodfire-7UrgnGVP9JibPuW24iRZrC7bLAIy031-gpwwOIadX4OW2VKWQKYkng",
    base_url="https://api.goodfire.ai/api/inference/v1",
)

response = oai_client.chat.completions.create(
    messages=[
        {"role": "user", "content": "who is this"},
    ],
    model="meta-llama/Meta-Llama-3.1-8B-Instruct",
)

print(response.choices[0].message.content)

