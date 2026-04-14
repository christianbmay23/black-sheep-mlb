"""Local lightweight Streamlit shim for constrained test environments."""

__version__ = "local-shim"

def set_page_config(**kwargs):
    return None

def title(text):
    print(text)

def write(text):
    print(text)

def header(text):
    print(text)

def json(obj):
    print(obj)

def dataframe(obj):
    print(obj)

def info(text):
    print(text)

def markdown(text):
    print(text)
