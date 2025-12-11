from transformers import pipeline
from PIL import Image

image = Image.open("saturn.png")
classifier = pipeline("image-classification")

print(classifier(image))
