# Gemini API 快速入门

本快速入门将向您介绍如何安装我们的[库](https://ai.google.dev/gemini-api/docs/libraries?hl=zh-cn)并发出您的第一个 Gemini API 请求。

## 准备工作

您需要 Gemini API 密钥。如果您还没有 API 密钥，可以[在 Google AI Studio 中免费获取](https://aistudio.google.com/app/apikey?hl=zh-cn)。

## 安装 Google GenAI SDK

[Python](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#python)[JavaScript](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#javascript)[Go](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#go)[Java](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#java)[Apps 脚本](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#apps-%E8%84%9A%E6%9C%AC)

使用 [Python 3.9 及更高版本](https://www.python.org/downloads/)，通过以下 [pip 命令](https://packaging.python.org/en/latest/tutorials/installing-packages/)安装 [`google-genai` 软件包](https://pypi.org/project/google-genai/)：

```
pip install -q -U google-genai
```

## 提交第一个请求

以下示例使用 [`generateContent`](https://ai.google.dev/api/generate-content?hl=zh-cn#method:-models.generatecontent) 方法，通过 Gemini 2.5 Flash 模型向 Gemini API 发送请求。

如果您将 API 密钥[设置为环境变量](https://ai.google.dev/gemini-api/docs/api-key?hl=zh-cn#set-api-env-var) `GEMINI_API_KEY`，那么在使用 [Gemini API 库](https://ai.google.dev/gemini-api/docs/libraries?hl=zh-cn)时，客户端会自动获取该密钥。否则，您需要在初始化客户端时[将 API 密钥作为实参传递](https://ai.google.dev/gemini-api/docs/api-key?hl=zh-cn#provide-api-key-explicitly)。

请注意，Gemini API 文档中的所有代码示例都假定您已设置环境变量 `GEMINI_API_KEY`。

[Python](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#python)[JavaScript](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#javascript)[Go](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#go)[Java](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#java)[Apps 脚本](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#apps-%E8%84%9A%E6%9C%AC)[REST](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#rest)

```
from google import genai

# The client gets the API key from the environment variable `GEMINI_API_KEY`.
client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash", contents="Explain how AI works in a few words"
)
print(response.text)
```

## 在我们的许多代码示例中，“思考”功能默认处于开启状态

本网站上的许多代码示例都使用 [Gemini 2.5 Flash](https://ai.google.dev/gemini-api/docs/models?hl=zh-cn#gemini-2.5-flash) 模型，该模型默认启用[“思考”](https://ai.google.dev/gemini-api/docs/thinking?hl=zh-cn)功能，以提高回答质量。请注意，这可能会增加响应时间和令牌用量。如果您优先考虑速度或希望最大限度地降低成本，可以将思考预算设置为零来停用此功能，如下例所示。如需了解详情，请参阅[思考指南](https://ai.google.dev/gemini-api/docs/thinking?hl=zh-cn#set-budget)。

**注意**： 思考功能仅适用于 Gemini 2.5 系列模型，并且无法在 Gemini 2.5 Pro 上停用。

[Python](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#python)[JavaScript](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#javascript)[Go](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#go)[REST](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#rest)[Apps 脚本](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn#apps-%E8%84%9A%E6%9C%AC)

```
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain how AI works in a few words",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
    ),
)
print(response.text)
```
# 使用 Gemini（又称 Nano Banana）生成图片

Gemini 可以通过对话方式生成和处理图片。你可以通过文字、图片或两者结合的方式向 Gemini 发出提示，从而以前所未有的控制力来创建、修改和迭代视觉内容：

- **Text-to-Image:**：根据简单或复杂的文本描述生成高质量图片。
- **图片 + Text-to-Image（编辑）**：提供图片，并使用文本提示添加、移除或修改元素、更改风格或调整色彩分级。
- **多图到图（合成和风格迁移）**：使用多张输入图片合成新场景，或将一张图片的风格迁移到另一张图片上。
- **迭代优化**：通过对话逐步优化图片，进行细微调整，直到达到理想效果。
- **高保真文本渲染**：准确生成包含清晰易读且位置合理的文本的图片，非常适合用于徽标、图表和海报。

所有生成的图片都包含 [SynthID 水印](https://ai.google.dev/responsible/docs/safeguards/synthid?hl=zh-cn)。

## 图片生成（文本转图片）

以下代码演示了如何根据描述性提示生成图片。

[Python](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#python)[JavaScript](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#javascript)[Go](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#go)[REST](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#rest)

```
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

prompt = (
    "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme"
)

response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents=[prompt],
)

for part in response.candidates[0].content.parts:
    if part.text is n
    ot None:
        print(part.text)
    elif part.inline_data is not None:
        image = Image.open(BytesIO(part.inline_data.data))
        image.save("generated_image.png")
```

![AI 生成的纳米香蕉菜肴图片](https://ai.google.dev/static/gemini-api/docs/images/nano-banana.png?hl=zh-cn)

AI 生成的图片：一家以 Gemini 为主题的餐厅中的纳米香蕉菜肴

## 图片修改（文本和图片转图片）

**提醒**：请确保您对上传的所有图片均拥有必要权利。 请勿生成侵犯他人权利的内容（包括用于欺骗、骚扰或伤害他人的视频或图片）。使用此生成式 AI 服务时须遵守我们的[《使用限制政策》](https://policies.google.com/terms/generative-ai/use-policy?hl=zh-cn)。

以下示例演示了如何上传以 base64 编码的图片。如需了解多张图片、较大载荷和支持的 MIME 类型，请参阅[图片理解](https://ai.google.dev/gemini-api/docs/image-understanding?hl=zh-cn)页面。

[Python](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#python)[JavaScript](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#javascript)[Go](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#go)[REST](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#rest)

```
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

prompt = (
    "Create a picture of my cat eating a nano-banana in a "
    "fancy restaurant under the Gemini constellation",
)

image = Image.open("/path/to/cat_image.png")

response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents=[prompt, image],
)

for part in response.candidates[0].content.parts:
    if part.text is not None:
        print(part.text)
    elif part.inline_data is not None:
        image = Image.open(BytesIO(part.inline_data.data))
        image.save("generated_image.png")
```

![AI 生成的图片：一只猫正在吃香蕉](https://ai.google.dev/static/gemini-api/docs/images/cat-banana.png?hl=zh-cn)

AI 生成的猫吃迷你香蕉的图片

## 其他图片生成模式

Gemini 还支持其他基于提示结构和上下文的图片互动模式，包括：

- **文生图和文本（交织）**：输出包含相关文本的图片。
    - 提示示例：“生成一份图文并茂的海鲜饭食谱。”
- **图片和文本转图片和文本（交织）**：使用输入图片和文本创建新的相关图片和文本。
    - 提示示例：（附带一张带家具的房间的照片）“我的空间还适合放置哪些颜色的沙发？你能更新一下图片吗？”
- **多轮图片修改（聊天）**：以对话方式持续生成和修改图片。
    - 提示示例：[上传一张蓝色汽车的图片。]，“把这辆车变成敞篷车”，“现在将颜色更改为黄色。”

## 提示指南和策略

要掌握 Gemini 2.5 Flash 图片生成功能，首先要了解一个基本原则：

> **描述场景，而不仅仅是列出关键字。** 该模型的核心优势在于其深厚的语言理解能力。与一连串不相关的字词相比，叙述性描述段落几乎总是能生成更好、更连贯的图片。

### 用于生成图片的提示

以下策略将帮助您创建有效的提示，从而生成您想要的图片。

#### 1. 逼真场景

对于逼真的图片，请使用摄影术语。提及拍摄角度、镜头类型、光线和细节，引导模型生成逼真的效果。

[模板](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%A8%A1%E6%9D%BF)[提示](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%8F%90%E7%A4%BA)[Python](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#python)

```
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

# Generate an image from a text prompt
response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents="A photorealistic close-up portrait of an elderly Japanese ceramicist with deep, sun-etched wrinkles and a warm, knowing smile. He is carefully inspecting a freshly glazed tea bowl. The setting is his rustic, sun-drenched workshop with pottery wheels and shelves of clay pots in the background. The scene is illuminated by soft, golden hour light streaming through a window, highlighting the fine texture of the clay and the fabric of his apron. Captured with an 85mm portrait lens, resulting in a soft, blurred background (bokeh). The overall mood is serene and masterful.",
)

image_parts = [
    part.inline_data.data
    for part in response.candidates[0].content.parts
    if part.inline_data
]

if image_parts:
    image = Image.open(BytesIO(image_parts[0]))
    image.save('photorealistic_example.png')
    image.show()
```

![一张逼真的特写肖像照片，照片中是一位年长的日本陶艺家...](https://ai.google.dev/static/gemini-api/docs/images/photorealistic_example.png?hl=zh-cn)

一位年长的日本陶艺家的照片级写实特写肖像...

#### 2. 风格化插画和贴纸

如需创建贴纸、图标或素材资源，请明确说明样式并要求使用透明背景。

[模板](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%A8%A1%E6%9D%BF)[提示](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%8F%90%E7%A4%BA)[Python](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#python)

```
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

# Generate an image from a text prompt
response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents="A kawaii-style sticker of a happy red panda wearing a tiny bamboo hat. It's munching on a green bamboo leaf. The design features bold, clean outlines, simple cel-shading, and a vibrant color palette. The background must be white.",
)

image_parts = [
    part.inline_data.data
    for part in response.candidates[0].content.parts
    if part.inline_data
]

if image_parts:
    image = Image.open(BytesIO(image_parts[0]))
    image.save('red_panda_sticker.png')
    image.show()
```

![一张可爱风格的贴纸，上面画着一个开心的红色...](https://ai.google.dev/static/gemini-api/docs/images/red_panda_sticker.png?hl=zh-cn)

一张可爱风格的贴纸，上面是一只快乐的小熊猫...

#### 3. 图片中的文字准确无误

Gemini 在渲染文本方面表现出色。清楚说明文字、字体样式（描述性）和整体设计。

[模板](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%A8%A1%E6%9D%BF)[提示](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%8F%90%E7%A4%BA)[Python](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#python)

```
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

# Generate an image from a text prompt
response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents="Create a modern, minimalist logo for a coffee shop called 'The Daily Grind'. The text should be in a clean, bold, sans-serif font. The design should feature a simple, stylized icon of a a coffee bean seamlessly integrated with the text. The color scheme is black and white.",
)

image_parts = [
    part.inline_data.data
    for part in response.candidates[0].content.parts
    if part.inline_data
]

if image_parts:
    image = Image.open(BytesIO(image_parts[0]))
    image.save('logo_example.png')
    image.show()
```

![为一家名为“The Daily Grind”的咖啡店设计一个现代简约的徽标…](https://ai.google.dev/static/gemini-api/docs/images/logo_example.png?hl=zh-cn)

为一家名为“The Daily Grind”的咖啡店设计一个现代简约的徽标...

#### 4. 产品模型和商业摄影

非常适合为电子商务、广告或品牌宣传制作清晰专业的商品照片。

[模板](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%A8%A1%E6%9D%BF)[提示](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%8F%90%E7%A4%BA)[Python](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#python)

```
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

# Generate an image from a text prompt
response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents="A high-resolution, studio-lit product photograph of a minimalist ceramic coffee mug in matte black, presented on a polished concrete surface. The lighting is a three-point softbox setup designed to create soft, diffused highlights and eliminate harsh shadows. The camera angle is a slightly elevated 45-degree shot to showcase its clean lines. Ultra-realistic, with sharp focus on the steam rising from the coffee. Square image.",
)

image_parts = [
    part.inline_data.data
    for part in response.candidates[0].content.parts
    if part.inline_data
]

if image_parts:
    image = Image.open(BytesIO(image_parts[0]))
    image.save('product_mockup.png')
    image.show()
```

![一张高分辨率的摄影棚级商品照片，展示的是一个简约的陶瓷咖啡杯...](https://ai.google.dev/static/gemini-api/docs/images/product_mockup.png?hl=zh-cn)

一张极简陶瓷咖啡杯的高分辨率产品照片，采用工作室灯光...

#### 5. 极简风格和负空间设计

非常适合用于创建网站、演示或营销材料的背景，以便在其中叠加文字。

[模板](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%A8%A1%E6%9D%BF)[提示](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%8F%90%E7%A4%BA)[Python](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#python)

```
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

# Generate an image from a text prompt
response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents="A minimalist composition featuring a single, delicate red maple leaf positioned in the bottom-right of the frame. The background is a vast, empty off-white canvas, creating significant negative space for text. Soft, diffused lighting from the top left. Square image.",
)

image_parts = [
    part.inline_data.data
    for part in response.candidates[0].content.parts
    if part.inline_data
]

if image_parts:
    image = Image.open(BytesIO(image_parts[0]))
    image.save('minimalist_design.png')
    image.show()
```

![一幅极简主义构图，画面中只有一片精致的红枫叶...](https://ai.google.dev/static/gemini-api/docs/images/minimalist_design.png?hl=zh-cn)

一幅极简主义构图，画面中只有一片精致的红枫叶...

#### 6. 连续艺术（漫画分格 / 故事板）

以角色一致性和场景描述为基础，为视觉故事讲述创建分格。

[模板](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%A8%A1%E6%9D%BF)[提示](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%8F%90%E7%A4%BA)[Python](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#python)

```
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

# Generate an image from a text prompt
response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents="A single comic book panel in a gritty, noir art style with high-contrast black and white inks. In the foreground, a detective in a trench coat stands under a flickering streetlamp, rain soaking his shoulders. In the background, the neon sign of a desolate bar reflects in a puddle. A caption box at the top reads \"The city was a tough place to keep secrets.\" The lighting is harsh, creating a dramatic, somber mood. Landscape.",
)

image_parts = [
    part.inline_data.data
    for part in response.candidates[0].content.parts
    if part.inline_data
]

if image_parts:
    image = Image.open(BytesIO(image_parts[0]))
    image.save('comic_panel.png')
    image.show()
```

![一张采用粗犷的黑色电影艺术风格的漫画单格画面...](https://ai.google.dev/static/gemini-api/docs/images/comic_panel.png?hl=zh-cn)

采用粗犷的黑色电影艺术风格的单幅漫画书画面...

### 用于修改图片的提示

以下示例展示了如何提供图片以及文本提示，以进行编辑、构图和风格迁移。

#### 1. 添加和移除元素

提供图片并描述您的更改。模型将与原始图片的风格、光照和透视效果相匹配。

[模板](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%A8%A1%E6%9D%BF)[提示](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%8F%90%E7%A4%BA)[Python](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#python)

```
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

# Base image prompt: "A photorealistic picture of a fluffy ginger cat sitting on a wooden floor, looking directly at the camera. Soft, natural light from a window."
image_input = Image.open('/path/to/your/cat_photo.png')
text_input = """Using the provided image of my cat, please add a small, knitted wizard hat on its head. Make it look like it's sitting comfortably and not falling off."""

# Generate an image from a text prompt
response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents=[text_input, image_input],
)

image_parts = [
    part.inline_data.data
    for part in response.candidates[0].content.parts
    if part.inline_data
]

if image_parts:
    image = Image.open(BytesIO(image_parts[0]))
    image.save('cat_with_hat.png')
    image.show()
```

|   |   |
|---|---|
|输入|输出|
|![一张照片般逼真的图片，画面中是一只毛茸茸的姜黄色猫。](https://ai.google.dev/static/gemini-api/docs/images/cat.png?hl=zh-cn)<br><br>一张逼真的图片，内容是一只毛绒绒的姜黄色猫...|![请使用提供的猫咪图片，添加一顶针织的小巫师帽...](https://ai.google.dev/static/gemini-api/docs/images/cat_with_hat.png?hl=zh-cn)<br><br>Using the provided image of my cat, please add a small, knitted wizard hat...|

#### 2. 局部重绘（语义遮盖）

通过对话定义“蒙版”，以修改图片的特定部分，同时保持其余部分不变。

[模板](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%A8%A1%E6%9D%BF)[提示](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%8F%90%E7%A4%BA)[Python](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#python)

```
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

# Base image prompt: "A wide shot of a modern, well-lit living room with a prominent blue sofa in the center. A coffee table is in front of it and a large window is in the background."
living_room_image = Image.open('/path/to/your/living_room.png')
text_input = """Using the provided image of a living room, change only the blue sofa to be a vintage, brown leather chesterfield sofa. Keep the rest of the room, including the pillows on the sofa and the lighting, unchanged."""

# Generate an image from a text prompt
response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents=[living_room_image, text_input],
)

image_parts = [
    part.inline_data.data
    for part in response.candidates[0].content.parts
    if part.inline_data
]

if image_parts:
    image = Image.open(BytesIO(image_parts[0]))
    image.save('living_room_edited.png')
    image.show()
```

|   |   |
|---|---|
|输入|输出|
|![广角照片：一间光线充足的现代客厅...](https://ai.google.dev/static/gemini-api/docs/images/living_room.png?hl=zh-cn)<br><br>一间光线充足的现代客厅的广角镜头…|![使用提供的客厅图片，将蓝色沙发更改为复古的棕色皮革切斯特菲尔德沙发...](https://ai.google.dev/static/gemini-api/docs/images/living_room_edited.png?hl=zh-cn)<br><br>使用提供的客厅图片，将蓝色沙发更改为复古棕色真皮切斯特菲尔德沙发...|

#### 3. 风格迁移

提供一张图片，并让模型以不同的艺术风格重新创作其内容。

[模板](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%A8%A1%E6%9D%BF)[提示](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%8F%90%E7%A4%BA)[Python](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#python)

```
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

# Base image prompt: "A photorealistic, high-resolution photograph of a busy city street in New York at night, with bright neon signs, yellow taxis, and tall skyscrapers."
city_image = Image.open('/path/to/your/city.png')
text_input = """Transform the provided photograph of a modern city street at night into the artistic style of Vincent van Gogh's 'Starry Night'. Preserve the original composition of buildings and cars, but render all elements with swirling, impasto brushstrokes and a dramatic palette of deep blues and bright yellows."""

# Generate an image from a text prompt
response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents=[city_image, text_input],
)

image_parts = [
    part.inline_data.data
    for part in response.candidates[0].content.parts
    if part.inline_data
]

if image_parts:
    image = Image.open(BytesIO(image_parts[0]))
    image.save('city_style_transfer.png')
    image.show()
```

|   |   |
|---|---|
|输入|输出|
|![一张逼真的高分辨率照片，画面中是一条繁忙的城市街道...](https://ai.google.dev/static/gemini-api/docs/images/city.png?hl=zh-cn)<br><br>一张逼真的高分辨率照片，拍摄的是繁忙的城市街道...|![将提供的现代城市街道夜景照片进行转换...](https://ai.google.dev/static/gemini-api/docs/images/city_style_transfer.png?hl=zh-cn)<br><br>将提供的夜间现代城市街道照片改造成...|

#### 4. 高级合成：组合多张图片

提供多张图片作为上下文，以创建新的合成场景。这非常适合制作产品模型或创意拼贴画。

[模板](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%A8%A1%E6%9D%BF)[提示](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%8F%90%E7%A4%BA)[Python](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#python)

```
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

# Base image prompts:
# 1. Dress: "A professionally shot photo of a blue floral summer dress on a plain white background, ghost mannequin style."
# 2. Model: "Full-body shot of a woman with her hair in a bun, smiling, standing against a neutral grey studio background."
dress_image = Image.open('/path/to/your/dress.png')
model_image = Image.open('/path/to/your/model.png')

text_input = """Create a professional e-commerce fashion photo. Take the blue floral dress from the first image and let the woman from the second image wear it. Generate a realistic, full-body shot of the woman wearing the dress, with the lighting and shadows adjusted to match the outdoor environment."""

# Generate an image from a text prompt
response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents=[dress_image, model_image, text_input],
)

image_parts = [
    part.inline_data.data
    for part in response.candidates[0].content.parts
    if part.inline_data
]

if image_parts:
    image = Image.open(BytesIO(image_parts[0]))
    image.save('fashion_ecommerce_shot.png')
    image.show()
```

|   |   |   |
|---|---|---|
|输入值 1|输入值 2|输出|
|![一张专业拍摄的照片，照片中是一位女性穿着蓝色碎花夏装...](https://ai.google.dev/static/gemini-api/docs/images/dress.png?hl=zh-cn)<br><br>一张专业拍摄的照片，照片中是一件蓝色印花夏季连衣裙…|![一位女性的全身照，她的头发盘成发髻...](https://ai.google.dev/static/gemini-api/docs/images/model.png?hl=zh-cn)<br><br>Full-body shot of a woman with her hair in a bun...|![制作专业电子商务时尚照片...](https://ai.google.dev/static/gemini-api/docs/images/fashion_ecommerce_shot.png?hl=zh-cn)<br><br>创建专业的电子商务时尚照片...|

#### 5. 高保真细节保留

为确保在编辑过程中保留关键细节（例如面部或徽标），请在编辑请求中详细描述这些细节。

[模板](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%A8%A1%E6%9D%BF)[提示](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#%E6%8F%90%E7%A4%BA)[Python](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn#python)

```
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

# Base image prompts:
# 1. Woman: "A professional headshot of a woman with brown hair and blue eyes, wearing a plain black t-shirt, against a neutral studio background."
# 2. Logo: "A simple, modern logo with the letters 'G' and 'A' in a white circle."
woman_image = Image.open('/path/to/your/woman.png')
logo_image = Image.open('/path/to/your/logo.png')
text_input = """Take the first image of the woman with brown hair, blue eyes, and a neutral expression. Add the logo from the second image onto her black t-shirt. Ensure the woman's face and features remain completely unchanged. The logo should look like it's naturally printed on the fabric, following the folds of the shirt."""

# Generate an image from a text prompt
response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents=[woman_image, logo_image, text_input],
)

image_parts = [
    part.inline_data.data
    for part in response.candidates[0].content.parts
    if part.inline_data
]

if image_parts:
    image = Image.open(BytesIO(image_parts[0]))
    image.save('woman_with_logo.png')
    image.show()
```

|   |   |   |
|---|---|---|
|输入值 1|输入值 2|输出|
|![一张专业头像，照片中的女性留着棕色头发，有着蓝色眼睛…](https://ai.google.dev/static/gemini-api/docs/images/woman.png?hl=zh-cn)<br><br>一张专业头像，一位留着棕色头发、有着蓝色眼睛的女性...|![一个简约的现代徽标，包含字母“G”和“A”...](https://ai.google.dev/static/gemini-api/docs/images/logo.png?hl=zh-cn)<br><br>一个包含字母“G”和“A”的简约现代徽标...|![拍摄第一张照片，照片中的女性留着棕色头发、有着蓝色眼睛，面部表情平静...](https://ai.google.dev/static/gemini-api/docs/images/woman_with_logo.png?hl=zh-cn)<br><br>拍摄第一张照片，照片中的女子留着棕色头发，有着蓝色眼睛，面部表情平静...|

### 最佳做法

如需将效果从“好”提升到“出色”，请将以下专业策略融入您的工作流程。

- **内容要非常具体**：您提供的信息越详细，您就越能掌控结果。不要使用“奇幻盔甲”，而是详细描述：“华丽的精灵板甲，蚀刻有银叶图案，带有高领和猎鹰翅膀形状的肩甲。”
- **提供背景信息和意图**：说明图片的_用途_。模型对上下文的理解会影响最终输出。例如，“为高端极简护肤品牌设计徽标”会比“设计徽标”产生更好的结果。
- **迭代和优化**：不要期望第一次尝试就能生成完美的图片。利用模型的对话特性进行小幅更改。然后，您可以继续提出提示，例如“效果很棒，但能让光线更暖一些吗？”或“保持所有内容不变，但让角色的表情更严肃一些。”
- **使用分步说明**：对于包含许多元素的复杂场景，请将提示拆分为多个步骤。“首先，创作一幅清晨薄雾笼罩的宁静森林背景。然后，在前景色中添加一个长满苔藓的古老石祭坛。 最后，在祭坛上放置一把发光的剑。”
- **使用“语义负提示”**：不要说“没有汽车”，而是积极地描述所需的场景：“一条空旷的荒凉街道，没有任何交通迹象。”
- **控制相机**：使用摄影和电影语言来控制构图。例如`wide-angle shot`、`macro shot`、`low-angle perspective`等字词。

## 限制

- 为获得最佳性能，请使用以下语言：英语、西班牙语（墨西哥）、日语（日本）、中文（中国）、印地语（印度）。
- 图片生成不支持音频或视频输入。
- 模型不一定会完全按照用户明确要求的图片输出数量生成图片。
- 该模型在输入最多 3 张图片时效果最佳。
- 在为图片生成文字时，最好先生成文字，然后再要求生成包含该文字的图片，这样 Gemini 的效果会更好。
- 目前，欧洲经济区 (EEA)、瑞士 (CH) 和英国 (UK) 不支持上传儿童照片。
- 所有生成的图片都包含 [SynthID 水印](https://ai.google.dev/responsible/docs/safeguards/synthid?hl=zh-cn)。

## 何时使用 Imagen

除了使用 Gemini 的内置图片生成功能外，您还可以通过 Gemini API 访问我们专门的图片生成模型 [Imagen](https://ai.google.dev/gemini-api/docs/imagen?hl=zh-cn)。

|属性|Imagen|Gemini 原生图片|
|---|---|---|
|优势|迄今为止功能最强大的图片生成模型。建议用于生成逼真的图像、提高清晰度、改进拼写和排版。|**默认建议。**  <br>无与伦比的灵活性、情境理解能力以及简单易用的无蒙版编辑功能。能够进行多轮对话式编辑。|
|可用性|已全面推出|预览版（允许用于生产环境）|
|延迟时间|**低**：针对近乎实时的性能进行了优化。|提高。其高级功能需要更多计算资源。|
|费用|可经济高效地完成专业任务。$0.02/图片至 $0.12/图片|基于 token 的定价。图片输出每 100 万个 token 的费用为 30 美元（图片输出的 token 数固定为每张图片 1, 290 个 token，最高分辨率为 1024x1024 像素）|
|推荐的任务|- 图片质量、写实程度、艺术细节或特定风格（例如印象派、动漫）是首要考虑因素。<br>- 融入品牌元素、风格，或生成徽标和产品设计。<br>- 生成高级拼写或排版。|- 生成交织的文本和图片，实现文本和图片的无缝融合。<br>- 通过单个提示组合多张图片中的广告素材元素。<br>- 对图片进行高度精细的修改，使用简单的语言命令修改单个元素，并以迭代方式处理图片。<br>- 将一张图片中的特定设计或纹理应用到另一张图片，同时保留原始对象的外形和细节。|

Imagen 4 应该是您开始使用 Imagen 生成图片的首选模型。如果需要处理高级用例或需要最佳图片质量，请选择 Imagen 4 Ultra（请注意，该模型一次只能生成一张图片）。

