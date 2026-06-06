import urllib.request
import xml.etree.ElementTree as ET

url = "https://raw.githubusercontent.com/NehanshuRathod/VendorBridge/main/metadata_statement/VendorBridge%20-%208%20hours.svg"
req = urllib.request.Request(url)
response = urllib.request.urlopen(req)
svg_data = response.read()

root = ET.fromstring(svg_data)
# Find all text elements. The namespace for SVG is usually http://www.w3.org/2000/svg
ns = {'svg': 'http://www.w3.org/2000/svg'}

texts = []
for text_node in root.findall('.//svg:text', ns):
    if text_node.text:
        texts.append(text_node.text.strip())
    # sometimes text is inside tspan
    for tspan in text_node.findall('.//svg:tspan', ns):
        if tspan.text:
            texts.append(tspan.text.strip())

print("\n".join([t for t in texts if t]))
