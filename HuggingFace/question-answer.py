from transformers import pipeline

qa = pipeline("question-answering")

context = "My name is Rina. I am 30 year old lady. I am very beautiful and smart. I work as a software engineer at Azure AI Foundry."

print(qa(question="who am I?", context=context))
