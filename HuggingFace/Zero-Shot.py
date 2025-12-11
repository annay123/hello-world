from transformers import pipeline

classifier = pipeline("zero-shot-classification")

print(classifier(
    "I want to buy a new iPhone soon.",
    candidate_labels=["technology", "sports", "food"],
))
