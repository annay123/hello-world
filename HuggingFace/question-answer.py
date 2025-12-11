from transformers import pipeline

qa = pipeline("question-answering")

context = "Azure AI Foundry allows developers to build, deploy, and manage AI models securely."

print(qa(question="What does Azure AI Foundry allow?", context=context))
