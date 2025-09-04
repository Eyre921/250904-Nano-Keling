

# 通用信息

## 调用域名

```JSON
https://api-beijing.klingai.com
```

## 接口鉴权

- Step-1：获取 **AccessKey** + **SecretKey**
    
- Step-2：您每次请求API的时候，需要按照固定加密方法生成 **API Token**
    
    - 加密方法：遵循JWT（Json Web Token, RFC 7519）标准
        
    - JWT由三个部分组成：Header、Payload、Signature
        

```Python

import time
import jwt

ak = "" # 填写access key
sk = "" # 填写secret key

def encode_jwt_token(ak, sk):
    headers = {
        "alg": "HS256",
        "typ": "JWT"
    }
    payload = {
        "iss": ak,
        "exp": int(time.time()) + 1800, # 有效时间，此处示例代表当前时间+1800s(30min)
        "nbf": int(time.time()) - 5 # 开始生效的时间，此处示例代表当前时间-5秒
    }
    token = jwt.encode(payload, sk, headers=headers)
    return token

api_token = encode_jwt_token(ak, sk)
print(api_token) # 打印生成的API_TOKEN
```

```Java

package test;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class JWTDemo {

    static String ak = ""; // 填写access key
    static String sk = ""; // 填写secret key

    public static void main(String[] args) {
        String token = sign(ak, sk);
        System.out.println(token); // 打印生成的API_TOKEN
    }
    static String sign(String ak,String sk) {
        try {
            Date expiredAt = new Date(System.currentTimeMillis() + 1800*1000); // 有效时间，此处示例代表当前时间+1800s(30min)
            Date notBefore = new Date(System.currentTimeMillis() - 5*1000); //开始生效的时间，此处示例代表当前时间-5秒
            Algorithm algo = Algorithm.HMAC256(sk);
            Map<String, Object> header = new HashMap<String, Object>();
            header.put("alg", "HS256");
            return JWT.create()
                    .withIssuer(ak)
                    .withHeader(header)
                    .withExpiresAt(expiredAt)
                    .withNotBefore(notBefore)
                    .sign(algo);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
```

- Step-3：用第二步生成的API Token组装成 **Authorization** ，填写到 **Request Header** 里
    
    - 组装方式： **Authorization = “Bearer XXX”** ， 其中XXX填写第二步生成的API Token（注意Bearer跟XXX之间有空格）
        

## 错误码

|         |      |        |                     |                                   |
| ------- | ---- | ------ | ------------------- | --------------------------------- |
| HTTP状态码 | 业务码  | 业务码定义  | 业务码解释               | 建议解决方案                            |
| 200     | 0    | 请求成功   | -                   | -                                 |
| 401     | 1000 | 身份验证失败 | 身份验证失败              | 检查Authorization是否正确               |
| 401     | 1001 | 身份验证失败 | Authorization为空     | 在RequestHeader中填写正确的Authorization |
| 401     | 1002 | 身份验证失败 | Authorization值非法    | 在RequestHeader中填写正确的Authorization |
| 401     | 1003 | 身份验证失败 | Authorization未到有效时间 | 检查token的开始生效时间，等待生效或重新签发          |
| 401     | 1004 | 身份验证失败 | Authorization已失效    | 检查token的有效期，重新签发                  |
| 429     | 1100 | 账户异常   | 账户异常                | 检查账户配置信息                          |
| 429     | 1101 | 账户异常   | 账户欠费 (后付费场景)        | 进行账户充值，确保余额充足                     |
| 429     | 1102 | 账户异常   | 资源包已用完/已过期（预付费场景）   | 购买额外的资源包，或开通后付费服务（如有）             |
| 403     | 1103 | 账户异常   | 请求的资源无权限，如接口/模型     | 检查账户权限                            |
| 400     | 1200 | 请求参数非法 | 请求参数非法              | 检查请求参数是否正确                        |
| 400     | 1201 | 请求参数非法 | 参数非法，如key写错或value非法 | 参考返回体中message字段的具体信息，修改请求参数       |
| 404     | 1202 | 请求参数非法 | 请求的method无效         | 查看接口文档，使用正确的requestmethod         |
| 404     | 1203 | 请求参数非法 | 请求的资源不存在，如模型        | 参考返回体中message字段的具体信息，修改请求参数       |
| 400     | 1300 | 触发策略   | 触发平台策略              | 检查是否触发平台策略                        |
| 400     | 1301 | 触发策略   | 触发平台的内容安全策略         | 检查输入内容，修改后重新发起请求                  |
| 429     | 1302 | 触发策略   | API请求过快，超过平台速率限制    | 降低请求频率、稍后重试，或联系客服增加限额             |
| 429     | 1303 | 触发策略   | 并发或QPS超出预付费资源包限制    | 降低请求频率、稍后重试，或联系客服增加限额             |
| 429     | 1304 | 触发策略   | 触发平台的IP白名单策略        | 联系客服                              |
| 500     | 5000 | 内部错误   | 服务器内部错误             | 稍后重试，或联系客服                        |
| 503     | 5001 | 内部错误   | 服务器暂时不可用，通常是在维护     | 稍后重试，或联系客服                        |
| 504     | 5002 | 内部错误   | 服务器内部超时，通常是发生积压     | 稍后重试，或联系客服                        |

# 文生视频

## 创建任务

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/text2video|POST|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求体

💡

请您注意，为了保持命名统一，原 model 字段变更为 model_name字段，未来请您使用该字段来指定需要调用的模型版本。

- 同时，我们保持了行为上的向前兼容，如您继续使用原 model字段，不会对接口调用有任何影响、不会有任何异常，等价于 model_name为空时的默认行为（即调用V1模型）

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|model_name|string|可选|**kling-v1**|模型名称  <br>枚举值：**kling-v1, kling-v1-6, kling-v2-master, kling-v2-1-master**|
|prompt|string|必须|无|正向文本提示词<br><br>- 不能超过2500个字符|
|negative_prompt|string|可选|空|负向文本提示词<br><br>- 不能超过2500个字符|
|cfg_scale|float|可选|**0.5**|生成视频的自由度；值越大，模型自由度越小，与用户输入的提示词相关性越强<br><br>- 取值范围：[0, 1]<br><br>kling-v2.x模型不支持当前参数|
|mode|string|可选|**std**|生成视频的模式<br><br>- 枚举值：std，pro<br>- 其中std：标准模式（标准），基础模式，性价比高<br>- 其中pro：专家模式（高品质），高表现模式，生成视频质量更佳<br><br>不同模型版本、视频模式支持范围不同，详见当前文档3-0能力地图|
|camera_control|object|可选|空|控制摄像机运动的协议（如未指定，模型将根据输入的文本/图片进行智能匹配）<br><br>不同模型版本、视频模式支持范围不同，详见当前文档3-0能力地图|
|camera_control<br><br>- type|string|可选|无|预定义的运镜类型<br><br>- 枚举值：“simple”, “down_back”, “forward_up”, “right_turn_forward”, “left_turn_forward”<br>- simple：简单运镜，此类型下可在"config"中六选一进行运镜<br>- down_back：镜头下压并后退 ➡️ 下移拉远，此类型下config参数无需填写<br>- forward_up：镜头前进并上仰 ➡️ 推进上移，此类型下config参数无需填写<br>- right_turn_forward：先右旋转后前进 ➡️ 右旋推进，此类型下config参数无需填写<br>- left_turn_forward：先左旋并前进 ➡️ 左旋推进，此类型下config参数无需填写|
|camera_control<br><br>- config|object|可选|无|包含六个字段，用于指定摄像机在不同方向上的运动或变化<br><br>- 当运镜类型指定simple时必填，指定其他类型时不填<br>- 以下参数6选1，即只能有一个参数不为0，其余参数为0|
|camera_control<br><br>- horizontal|float|可选|无|水平运镜，控制摄像机在水平方向上的移动量（沿x轴平移）  <br>取值范围：[-10, 10]，负值表示向左平移，正值表示向右平移|
|camera_control<br><br>- vertical|float|可选|无|垂直运镜，控制摄像机在垂直方向上的移动量（沿y轴平移）  <br>取值范围：[-10, 10]，负值表示向下平移，正值表示向上平移|
|camera_control<br><br>- pan|float|可选|无|水平摇镜，控制摄像机在水平面上的旋转量（绕y轴旋转）  <br>取值范围：[-10, 10]，负值表示绕y轴向左旋转，正值表示绕y轴向右旋转|
|camera_control<br><br>- tilt|float|可选|无|垂直摇镜，控制摄像机在垂直面上的旋转量（沿x轴旋转）  <br>取值范围：[-10, 10]，负值表示绕x轴向下旋转，正值表示绕x轴向上旋转|
|camera_control<br><br>- roll|float|可选|无|旋转运镜，控制摄像机的滚动量（绕z轴旋转）  <br>取值范围：[-10, 10]，负值表示绕z轴逆时针旋转，正值表示绕z轴顺时针旋转|
|camera_control<br><br>- zoom|float|可选|无|变焦，控制摄像机的焦距变化，影响视野的远近  <br>取值范围：[-10, 10]，负值表示焦距变长、视野范围变小，正值表示焦距变短、视野范围变大|
|aspect_ratio|string|可选|16:9|生成视频的画面纵横比（宽:高）  <br>枚举值：16:9, 9:16, 1:1|
|duration|string|可选|5|生成视频时长，单位s  <br>枚举值：5，10|
|callback_url|string|可选|无|本次任务结果回调通知地址，如果配置，服务端会在任务状态发生变更时主动通知  <br>具体通知的消息schema见“Callback协议”|
|external_task_id|string|可选|无|自定义任务ID<br><br>- 用户自定义任务ID，传入不会覆盖系统生成的任务ID，但支持通过该ID进行任务查询<br>- 请注意，单用户下需要保证唯一性|

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

`{   "code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题   "data": {     "task_id": "string", //任务ID，系统生成     "task_info": {       //任务创建时的参数信息       "external_task_id": "string" //客户自定义任务ID     },     "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）     "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms     "updated_at": 1722769557708 //任务更新时间，Unix时间戳、单位ms   } }`

## 查询任务（单个）

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/text2video/{id}|GET|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求路径参数

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|task_id|string|可选|无|文生视频的任务ID  <br>请求路径参数，直接将值填写在请求路径中，与external_task_id两种查询方式二选一|
|external_task_id|string|可选|无|文生视频的自定义任务ID  <br>创建任务时填写的external_task_id，与task_id两种查询方式二选一|

### 请求体

无

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

`{   "code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题   "data":{   	"task_id": "string", //任务ID，系统生成     "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）     "task_status_msg": "string", //任务状态信息，当任务失败时展示失败原因（如触发平台的内容风控等）     "task_info": { //任务创建时的参数信息       "external_task_id": "string"//客户自定义任务ID     },     "task_result":{       "videos":[         {         	"id": "string", //生成的视频ID；全局唯一       		"url": "string", //生成视频的URL，例如https://p1.a.kwimgs.com/bs2/upload-ylab-stunt/special-effect/output/HB1_PROD_ai_web_46554461/-2878350957757294165/output.mp4（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）       		"duration": "string" //视频总时长，单位s         }       ]     }     "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms     "updated_at": 1722769557708, //任务更新时间，Unix时间戳、单位ms   } }`

## 查询任务（列表）

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/text2video|GET|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 查询参数

/v1/videos/text2video?pageNum=1&pageSize=30

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|pageNum|int|可选|1|页码  <br>取值范围：[1,1000]|
|pageSize|int|可选|30|每页数据量  <br>取值范围：[1,500]|

### 请求体

无

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

`{   "code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题   "data":[     {       "task_id": "string", //任务ID，系统生成       "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）       "task_status_msg": "string", //任务状态信息，当任务失败时展示失败原因（如触发平台的内容风控等）       "task_info": { //任务创建时的参数信息         "external_task_id": "string"//任务ID，客户自定义生成，与task_id两种查询方式二选一       },       "task_result":{         "videos":[           {             "id": "string", //生成的视频ID；全局唯一             "url": "string", //生成视频的URL，例如https://p1.a.kwimgs.com/bs2/upload-ylab-stunt/special-effect/output/HB1_PROD_ai_web_46554461/-2878350957757294165/output.mp4（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）             "duration": "string" //视频总时长，单位s           }         ]     	}       "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms       "updated_at": 1722769557708, //任务更新时间，Unix时间戳、单位ms     }   ] }`


# 图生视频

## 创建任务

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/image2video|POST|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求体

💡

请您注意，为了保持命名统一，原 model字段变更为 model_name字段，未来请您使用该字段来指定需要调用的模型版本。

- 同时，我们保持了行为上的向前兼容，如您继续使用原 model字段，不会对接口调用有任何影响、不会有任何异常，等价于 model_name为空时的默认行为（即调用V1模型）

Bash

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

`curl --location --request POST 'https://api-beijing.klingai.com/v1/videos/image2video' \ --header 'Authorization: Bearer xxx' \ --header 'Content-Type: application/json' \ --data-raw '{     "model_name": "kling-v1",     "mode": "pro",     "duration": "5",     "image": "https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg",     "prompt": "宇航员站起身走了",     "cfg_scale": 0.5,     "static_mask": "https://h2.inkwai.com/bs2/upload-ylab-stunt/ai_portal/1732888177/cOLNrShrSO/static_mask.png",     "dynamic_masks": [       {         "mask": "https://h2.inkwai.com/bs2/upload-ylab-stunt/ai_portal/1732888130/WU8spl23dA/dynamic_mask_1.png",         "trajectories": [           {"x":279,"y":219},{"x":417,"y":65}         ]       }     ] }'`

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|model_name|string|可选|kling-v1|模型名称<br><br>- 枚举值：kling-v1, kling-v1-5, kling-v1-6, kling-v2-master, kling-v2-1, kling-v2-1-master|
|image|string|必须|空|参考图像<br><br>- 支持传入图片Base64编码或图片URL（确保可访问）<br><br>请注意，若您使用base64的方式，请确保您传递的所有图像数据参数均采用Base64编码格式。在提交数据时，请不要在Base64编码字符串前添加任何前缀，例如data:image/png;base64,。正确的参数格式应该直接是Base64编码后的字符串。<br><br>示例：<br><br>正确的Base64编码参数：<br><br>1<br><br>`iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`<br><br>错误的Base64编码参数（包含data:前缀）：<br><br>1<br><br>`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`<br><br>请仅提供Base64编码的字符串部分，以便系统能够正确处理和解析您的数据。<br><br>- 图片格式支持.jpg / .jpeg / .png<br>- 图片文件大小不能超过10MB，图片宽高尺寸不小于300px，图片宽高比介于1:2.5 ~ 2.5:1之间<br>- image 参数与 image_tail 参数至少二选一，二者不能同时为空<br>- image + image_tail参数、dynamic_masks/static_mask参数、camera_control参数三选一，不能同时使用<br><br>不同模型版本、视频模式支持范围不同，详见当前文档3-0能力地图|
|image_tail|string|可选|空|参考图像 - 尾帧控制<br><br>- 支持传入图片Base64编码或图片URL（确保可访问）<br><br>请注意，若您使用base64的方式，请确保您传递的所有图像数据参数均采用Base64编码格式。在提交数据时，请不要在Base64编码字符串前添加任何前缀，例如data:image/png;base64,。正确的参数格式应该直接是Base64编码后的字符串。<br><br>示例：<br><br>正确的Base64编码参数：<br><br>1<br><br>`iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`<br><br>错误的Base64编码参数（包含data:前缀）：<br><br>1<br><br>`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`<br><br>请仅提供Base64编码的字符串部分，以便系统能够正确处理和解析您的数据。<br><br>- 图片格式支持.jpg / .jpeg / .png<br>- 图片文件大小不能超过10MB，图片宽高尺寸不小于300px<br>- image 参数与 image_tail 参数至少二选一，二者不能同时为空<br>- image+image_tail参数、dynamic_masks/static_mask参数、camera_control参数三选一，不能同时使用<br><br>不同模型版本、视频模式支持范围不同，详见当前文档3-0能力地图|
|prompt|string|可选|无|正向文本提示词<br><br>- 不能超过2500个字符|
|negative_prompt|string|可选|空|负向文本提示词<br><br>- 不能超过2500个字符|
|cfg_scale|float|可选|0.5|生成视频的自由度；值越大，模型自由度越小，与用户输入的提示词相关性越强<br><br>- 取值范围：[0, 1]|
|mode|string|可选|std|生成视频的模式<br><br>- 枚举值：std，pro<br>- 其中std：标准模式（标准），基础模式，性价比高<br>- 其中pro：专家模式（高品质），高表现模式，生成视频质量更佳<br><br>不同模型版本、视频模式支持范围不同，详见当前文档3-0能力地图|
|static_mask|string|可选|无|静态笔刷涂抹区域（用户通过运动笔刷涂抹的 mask 图片）<br><br>“运动笔刷”能力包含“动态笔刷 dynamic_masks”和“静态笔刷 static_mask”两种<br><br>- 支持传入图片Base64编码或图片URL（确保可访问，格式要求同 image 字段）<br>- 图片格式支持.jpg / .jpeg / .png<br>- 图片长宽比必须与输入图片相同（即image字段），否则任务失败（failed）<br>- static_mask 和 dynamic_masks.mask 这两张图片的分辨率必须一致，否则任务失败（failed）<br><br>不同模型版本、视频模式支持范围不同，详见当前文档3-0能力地图|
|dynamic_masks|array|可选|无|动态笔刷配置列表<br><br>可配置多组（最多6组），每组包含“涂抹区域 mask”与“运动轨迹 trajectories”序列不同模型版本、视频模式支持范围不同，详见当前文档3-0能力地图|
|dynamic_masks<br><br>- mask|string|可选|无|动态笔刷涂抹区域（用户通过运动笔刷涂抹的 mask 图片）<br><br>- 支持传入图片Base64编码或图片URL（确保可访问，格式要求同 image 字段）<br>- 图片格式支持.jpg / .jpeg / .png<br>- 图片长宽比必须与输入图片相同（即image字段），否则任务失败（failed）<br>- static_mask 和 dynamic_masks.mask 这两张图片的分辨率必须一致，否则任务失败（failed）|
|dynamic_masks<br><br>- trajectories|array|可选|无|运动轨迹坐标序列<br><br>- 生成5s的视频，轨迹长度不超过77，即坐标个数取值范围：[2, 77]<br>- 轨迹坐标系，以图片左下角为坐标原点<br><br>注1：坐标点个数越多轨迹刻画越准确，如只有2个轨迹点则为这两点连接的直线<br><br>注2：轨迹方向以传入顺序为指向，以最先传入的坐标为轨迹起点，依次链接后续坐标形成运动轨迹|
|dynamic_masks<br><br>- trajectories<br>    - x|int|可选|无|轨迹点横坐标（在像素二维坐标系下，以输入图片image左下为原点的像素坐标）|
|dynamic_masks<br><br>- trajectories<br>    - y|int|可选|无|轨迹点纵坐标（在像素二维坐标系下，以输入图片image左下为原点的像素坐标）|
|camera_control|object|可选|空|控制摄像机运动的协议（如未指定，模型将根据输入的文本/图片进行智能匹配）<br><br>不同模型版本、视频模式支持范围不同，详见当前文档3-0能力地图|
|camera_control<br><br>- type|string|可选|无|预定义的运镜类型<br><br>- 枚举值：“simple”, “down_back”, “forward_up”, “right_turn_forward”, “left_turn_forward”<br>- simple：简单运镜，此类型下可在"config"中六选一进行运镜<br>- down_back：镜头下压并后退 ➡️ 下移拉远，此类型下config参数无需填写<br>- forward_up：镜头前进并上仰 ➡️ 推进上移，此类型下config参数无需填写<br>- right_turn_forward：先右旋转后前进 ➡️ 右旋推进，此类型下config参数无需填写<br>- left_turn_forward：先左旋并前进 ➡️ 左旋推进，此类型下config参数无需填写|
|camera_control<br><br>- config|object|可选|无|包含六个字段，用于指定摄像机在不同方向上的运动或变化<br><br>- 当运镜类型指定simple时必填，指定其他类型时不填<br>- 以下参数6选1，即只能有一个参数不为0，其余参数为0|
|config<br><br>- horizontal|float|可选|无|水平运镜，控制摄像机在水平方向上的移动量（沿x轴平移）<br><br>- 取值范围：[-10, 10]，负值表示向左平移，正值表示向右平移|
|config<br><br>- vertical|float|可选|无|垂直运镜，控制摄像机在垂直方向上的移动量（沿y轴平移）<br><br>- 取值范围：[-10, 10]，负值表示向下平移，正值表示向上平移|
|config<br><br>- pan|float|可选|无|水平摇镜，控制摄像机在水平面上的旋转量（绕y轴旋转）<br><br>- 取值范围：[-10, 10]，负值表示绕y轴向左旋转，正值表示绕y轴向右旋转|
|config<br><br>- tilt|float|可选|无|垂直摇镜，控制摄像机在垂直面上的旋转量（沿x轴旋转）<br><br>- 取值范围：[-10, 10]，负值表示绕x轴向下旋转，正值表示绕x轴向上旋转|
|config<br><br>- roll|float|可选|无|旋转运镜，控制摄像机的滚动量（绕z轴旋转）<br><br>- 取值范围：[-10, 10]，负值表示绕z轴逆时针旋转，正值表示绕z轴顺时针旋转|
|config<br><br>- zoom|float|可选|无|变焦，控制摄像机的焦距变化，影响视野的远近<br><br>- 取值范围：[-10, 10]，负值表示焦距变长、视野范围变小，正值表示焦距变短、视野范围变大|
|duration|string|可选|5|生成视频时长，单位s<br><br>- 枚举值：5，10|
|callback_url|string||无|本次任务结果回调通知地址，如果配置，服务端会在任务状态发生变更时主动通知<br><br>- 具体通知的消息schema见“Callback协议”|
|external_task_id|string|可选|无|自定义任务ID<br><br>- 用户自定义任务ID，传入不会覆盖系统生成的任务ID，但支持通过该ID进行任务查询<br>- 请注意，单用户下需要保证唯一性|

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

`{   "code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题   "data": {     "task_id": "string", //任务ID，系统生成     "task_info": {       //任务创建时的参数信息       "external_task_id": "string" //客户自定义任务ID     },     "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）     "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms     "updated_at": 1722769557708 //任务更新时间，Unix时间戳、单位ms   } }`

## 查询任务（单个）

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/image2video/{id}|GET|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求路径参数

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|task_id|string|可选|无|图生视频的任务ID  <br>请求路径参数，直接将值填写在请求路径中，与external_task_id两种查询方式二选一|
|external_task_id|string|可选|无|图生视频的自定义任务ID  <br>创建任务时填写的external_task_id，与task_id两种查询方式二选一|

### 请求体

无

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

`{   "code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题   "data":{   	"task_id": "string", //任务ID，系统生成     "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）     "task_status_msg": "string", //任务状态信息，当任务失败时展示失败原因（如触发平台的内容风控等）     "task_info": { //任务创建时的参数信息       "external_task_id": "string"//客户自定义任务ID     },     "task_result":{       "videos":[         {         	"id": "string", //生成的视频ID；全局唯一       		"url": "string", //生成视频的URL，例如https://p1.a.kwimgs.com/bs2/upload-ylab-stunt/special-effect/output/HB1_PROD_ai_web_46554461/-2878350957757294165/output.mp4（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）       		"duration": "string" //视频总时长，单位s         }       ]     }     "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms     "updated_at": 1722769557708, //任务更新时间，Unix时间戳、单位ms   } }`

## 查询任务（列表）

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/image2video|GET|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 查询参数

/v1/videos/image2video?pageNum=1&pageSize=30

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|pageNum|int|可选|1|页码  <br>取值范围：[1,1000]|
|pageSize|int|可选|30|每页数据量  <br>取值范围：[1,500]|

### 请求体

无

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

`{   "code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题   "data":[     {       "task_id": "string", //任务ID，系统生成       "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）       "task_status_msg": "string", //任务状态信息，当任务失败时展示失败原因（如触发平台的内容风控等）       "task_info": { //任务创建时的参数信息         "external_task_id": "string"//客户自定义任务ID       },       "task_result":{         "videos":[           {             "id": "string", //生成的视频ID；全局唯一             "url": "string", //生成视频的URL，例如https://p1.a.kwimgs.com/bs2/upload-ylab-stunt/special-effect/output/HB1_PROD_ai_web_46554461/-2878350957757294165/output.mp4（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）             "duration": "string" //视频总时长，单位s           }         ]     	}       "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms       "updated_at": 1722769557708, //任务更新时间，Unix时间戳、单位ms     }   ] }`


# 多图参考生视频

## 创建任务

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/multi-image2video|POST|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求体

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|model_name|string|可选|kling-v1-6|模型名称<br><br>- 枚举值：kling-v1-6|
|image_list|array|必须|空|- 最多支持4张图片，用key:value承载，如下：<br><br>1<br><br>2<br><br>3<br><br>4<br><br>5<br><br>6<br><br>7<br><br>8<br><br>9<br><br>10<br><br>11<br><br>12<br><br>13<br><br>14<br><br>`"image_list":[ 	{   	"image":"image_url"   }, 	{   	"image":"image_url"   }, 	{   	"image":"image_url"   }, 	{   	"image":"image_url"   } ]`<br><br>- API端无裁剪逻辑，请直接上传已选主体后的图片<br>- 支持传入图片Base64编码或图片URL（确保可访问）<br><br>请注意，若您使用base64的方式，请确保您传递的所有图像数据参数均采用Base64编码格式。在提交数据时，请不要在Base64编码字符串前添加任何前缀，例如data:image/png;base64,。正确的参数格式应该直接是Base64编码后的字符串。<br><br>示例：<br><br>正确的Base64编码参数：<br><br>1<br><br>`iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`<br><br>错误的Base64编码参数（包含data:前缀）：<br><br>1<br><br>`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`<br><br>请仅提供Base64编码的字符串部分，以便系统能够正确处理和解析您的数据。<br><br>- 图片格式支持.jpg / .jpeg / .png<br>- 图片文件大小不能超过10MB，图片宽高尺寸不小于300px，图片宽高比介于1:2.5 ~ 2.5:1之间|
|prompt|string|可选|无|正向文本提示词<br><br>- 不能超过2500个字符|
|negative_prompt|string|可选|空|负向文本提示词<br><br>- 不能超过2500个字符|
|mode|string|可选|std|生成视频的模式<br><br>- 枚举值：std，pro<br>- 其中std：标准模式（标准），基础模式，性价比高<br>- 其中pro：专家模式（高品质），高表现模式，生成视频质量更佳<br><br>不同模型版本、视频模式支持范围不同，详见当前文档3-0能力地图|
|duration|string|可选|5|生成视频时长，单位s<br><br>- 枚举值：5，10|
|aspect_ratio|string|可选|16:9|生成图片的画面纵横比（宽:高）<br><br>- 枚举值：16:9, 9:16, 1:1|
|callback_url|string||无|本次任务结果回调通知地址，如果配置，服务端会在任务状态发生变更时主动通知<br><br>- 具体通知的消息schema见“Callback协议”|
|external_task_id|string|可选|无|自定义任务ID<br><br>- 用户自定义任务ID，传入不会覆盖系统生成的任务ID，但支持通过该ID进行任务查询<br>- 请注意，单用户下需要保证唯一性|

## 查询任务（单个）

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/multi-image2video/{id}|GET|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求路径参数

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|task_id|string|可选|无|多图参考生视频的任务ID  <br>请求路径参数，直接将值填写在请求路径中，与external_task_id两种查询方式二选一|
|external_task_id|string|可选|无|多图参考生视频的自定义任务ID  <br>创建任务时填写的external_task_id，与task_id两种查询方式二选一|

### 请求体

无

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

`{   "code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题   "data":{   	"task_id": "string", //任务ID，系统生成     "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）     "task_status_msg": "string", //任务状态信息，当任务失败时展示失败原因（如触发平台的内容风控等）     "task_info": { //任务创建时的参数信息       "external_task_id": "string"//客户自定义任务ID     },     "task_result":{       "videos":[         {         	"id": "string", //生成的视频ID；全局唯一       		"url": "string", //生成视频的URL，例如https://p1.a.kwimgs.com/bs2/upload-ylab-stunt/special-effect/output/HB1_PROD_ai_web_46554461/-2878350957757294165/output.mp4（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）       		"duration": "string" //视频总时长，单位s         }       ]     }     "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms     "updated_at": 1722769557708, //任务更新时间，Unix时间戳、单位ms   } }`

## 查询任务（列表）

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/multi-image2video|GET|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 查询参数

/v1/videos/multi-image2video?pageNum=1&pageSize=30

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|pageNum|int|可选|1|页码  <br>取值范围：[1,1000]|
|pageSize|int|可选|30|每页数据量  <br>取值范围：[1,500]|

### 请求体

无

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

`{   "code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题   "data":[     {       "task_id": "string", //任务ID，系统生成       "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）       "task_status_msg": "string", //任务状态信息，当任务失败时展示失败原因（如触发平台的内容风控等）       "task_info": { //任务创建时的参数信息         "external_task_id": "string"//客户自定义任务ID       },       "task_result":{         "videos":[           {             "id": "string", //生成的视频ID；全局唯一             "url": "string", //生成视频的URL，例如https://p1.a.kwimgs.com/bs2/upload-ylab-stunt/special-effect/output/HB1_PROD_ai_web_46554461/-2878350957757294165/output.mp4（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）             "duration": "string" //视频总时长，单位s           }         ]     	}       "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms       "updated_at": 1722769557708, //任务更新时间，Unix时间戳、单位ms     }   ] }`

# 多模态视频编辑

## 初始化待编辑视频

💡

操作指引：使用“多模态视频编辑”功能时，需先对原始视频进行初始化处理。其中，在替换或删除现有视频中的元素时，需先标记视频中相关元素。

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/multi-elements/init-selection|POST|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求体

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|video_id|string|可选|空|视频ID，从历史作品中选择待编辑的视频，仅支持仅30天时间生成的视频作品<br><br>- 仅支持时长≥2秒且≤5秒，或≥7秒且≤10秒的视频<br>- 与video_url参数相关，不能同时为空，也不能同时有值|
|video_url|string|可选|无|获取视频的URL，上传时传视频下载链接，编辑选区时传接口返回的视频URL<br><br>- 仅支持MP4和MOV格式<br>- 仅支持时长≥2秒且≤5秒，或≥7秒且≤10秒的视频<br>- 视频宽高尺寸需介于720px（含）和2160px（含）之间<br>- 仅支持上传24、30或60fps的视频<br>- 与video_url参数相关，不能同时为空，也不能同时有值|

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

`{ 	"code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题 	"data": { 		"status": 0, // 拒识码，非0为识别失败     "session_id": "id", //会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变，有效期24小时      // 新建待编辑视频阶段的返回结果     "fps": 30.0, //解析后视频的帧数，在获取选区展示视频时需携参     "original_duration": 1000, // 解析后视频的时长，在创建任务时需携参     "width": 720, // 解析后视频的宽，暂无作用     "height": 1280, // 解析后视频的宽，暂无作用     "total_frame": 300,  // 解析后视频的总帧数，在创建任务时需携参     "normalized_video": "url" //初始化后的视频URL   } }`

## 增加视频选区

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/multi-elements/add-selection|GET|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求路径参数

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|session_id|string|必须|无|会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变|
|frame_index|int|必须|无|帧号<br><br>- 最多支持添加10个标记帧，即最多基于10帧标记视频选区<br>- 1次仅支持标记1帧|
|points|object[]|必须|无|点选坐标，用x、y表示<br><br>- 取值范围：[0,1]，用百分比表示；[0,1]代表画面左上角<br>- 支持同时增加多个标记点，某一帧最多可标记10个点|

### 请求体

无

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

28

29

30

`{   "code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题 	"data": { 		"status": 0, // 拒识码，非0为识别失败       "session_id": "id", //会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变，有效期24小时 		"res": {        // 增加选区、删减选区、移除全部选区3个阶段的图像分割返回结果       "frame_index": 0,       "rle_mask_list": [{         "object_id": 0,         "rle_mask": {           "size": [             720,             1280           ],           "counts": "string"         },         "png_mask": {           "size": [             720,             1280           ],           "base64": "string"         }       }]   	} 	} }`

### 示例代码

解析图像分割结果

TypeScript

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

28

29

30

31

32

33

34

35

36

37

38

39

40

41

42

43

44

45

46

47

48

49

50

51

52

53

54

55

56

57

58

59

60

61

62

`export type RLEObject = {   size: [h: number, w: number]   counts: string } type RLE = {   h: number   w: number   m: number   binaries: number[] } export function decode(rleObj: RLEObject) {   const [h, w] = rleObj.size   const R: RLE = { h, w, m: 0, binaries: [0] }   rleFrString(R, rleObj.counts)   const unitArray = new Uint8Array(h * w)   rleDecode(R, unitArray)   return unitArray } function rleDecode(R: RLE, M: Uint8Array) {   let j   let k   let p = 0   let v = false   for (j = 0; j < R.m; j++) {     for (k = 0; k < R.binaries[j]; k++) {       const x = Math.floor(p / R.h)       const y = p % R.h       M[y * R.w + x] = v === false ? 0 : 1 // 注意此处是 y * width + x，即横着排列       p++     }     v = !v   } } function rleFrString(R: RLE, s: string) {   let m = 0   let p = 0   let k   let x   let more   const binaries = []   while (s[p]) {     x = 0     k = 0     more = 1     while (more) {       const c = s.charCodeAt(p) - 48       x |= (c & 0x1f) << (5 * k)       more = c & 0x20       p++       k++       if (!more && c & 0x10) {         x |= -1 << (5 * k)       }     }     if (m > 2) {       x += binaries[m - 2]     }     binaries[m++] = x   }   R.m = m   R.binaries = binaries }`

绘制图像分割图层

TypeScript

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

`// height 为视频的高度 width 为视频的宽度 function drawMask(rleMask: string, height: number, width: number) {   if (!canvasRef.value) return   const ctx = canvasRef.value.getContext('2d')   if (!ctx) return    const decodeData = decode({ counts: rleMask, size: [height, width] })   const imageData = ctx.createImageData(width, height)   for (let y = 0; y < height; y++) {     for (let x = 0; x < width; x++) {       const index = y * width + x       if (decodeData[index]) {         const imageIndex = index * 4         // 设置像素点颜色：红色，绿色，蓝色，透明度         imageData.data[imageIndex] = 116 // 红色         imageData.data[imageIndex + 1] = 255 // 绿色         imageData.data[imageIndex + 2] = 82 // 蓝色         imageData.data[imageIndex + 3] = 163 // 透明度       }     }   }   ctx.putImageData(imageData, 0, 0) }`

## 删减视频选区

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/multi-elements/delete-selection|POST|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求体

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|session_id|string|必须|无|会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变|
|frame_index|int|必须|无|帧号|
|points|object[]|必须|无|点选坐标，用x、y表示<br><br>- 取值范围：[0,1]，用百分比表示；[0,1]代表画面左上角<br>- 支持同时增加多个标记点<br>- 坐标点需与增加视频选区时完全一致|

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

28

29

30

`{ 	"code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题 	"data": { 		"status": 0, // 拒识码，非0为识别失败     "session_id": "id", //会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变，有效期24小时 		"res": {        // 增加选区、删减选区、移除全部选区3个阶段的图像分割返回结果       "frame_index": 0,       "rle_mask_list": [{         "object_id": 0,         "rle_mask": {           "size": [             720,             1280           ],           "counts": "string"         },         "png_mask": {           "size": [             720,             1280           ],           "base64": "string"         }       }]   	} 	} }`

## 清除视频选区

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/multi-elements/clear-selection|POST|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求体

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|session_id|string|必须|无|会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变|

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

`{ 	"code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题 	"data": { 		"status": 0, // 拒识码，非0为识别失败     "session_id": "id", //会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变，有效期24小时 	} }`

## 预览已选区视频

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/multi-elements/preview-selection|POST|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求体

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|session_id|string|必须|无|会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变|

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

`{ 	"code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题 	"data": { 		"status": 0, // 拒识码，非0为识别失败     "session_id": "id", //会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变，有效期24小时  		"res": {          // 获取展区展示视频阶段的返回结果         "video": "url", // 含mask的视频         "video_cover": "url", // 含mask的视频的封面         "tracking_output": "url" // 图像分割结果中，每一帧mask结果       }     } }`

## 创建任务

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/multi-elements/|POST|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求体

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|model_name|string|可选|kling-v1-6|模型名称<br><br>- 枚举值：kling-v1-6|
|session_id|string|必须|无|会话ID<br><br>- 会基于视频初始化任务生成，不会随编辑选区行为而改变|
|edit_mode|string|必须|无|操作类型<br><br>- 枚举值：addition, swap, removal, 其中：<br>    - addition：增加元素<br>    - swap：替换元素<br>    - removal：删除元素|
|image_list|array|可选|空|裁剪后的参考图像<br><br>- 增加视频元素时：当前参数必填，可上传1~2张图片<br>- 编辑视频元素时：当前参数必填，仅可上传1张图片<br>- 删除视频元素时，当前参数无需填写<br>- 用key:value承载，如下：<br><br>1<br><br>2<br><br>3<br><br>4<br><br>5<br><br>6<br><br>7<br><br>8<br><br>`"image_list":[ 	{   	"image":"image_url"   }, 	{   	"image":"image_url"   } ]`<br><br>- API端无裁剪逻辑，请直接上传已选主体后的片<br>- 支持传入图片Base64编码或图片URL（确保可访问）<br><br>请注意，若您使用base64的方式，请确保您传递的所有图像数据参数均采用Base64编码格式。在提交数据时，请不要在Base64编码字符串前添加任何前缀，例如data:image/png;base64,。正确的参数格式应该直接是Base64编码后的字符串。<br><br>示例：<br><br>正确的Base64编码参数：<br><br>1<br><br>`iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`<br><br>错误的Base64编码参数（包含data:前缀）：<br><br>1<br><br>`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`<br><br>请仅提供Base64编码的字符串部分，以便系统能够正确处理和解析您的数据。<br><br>- 图片格式支持.jpg / .jpeg / .png<br>- 图片文件大小不能超过10MB，图片宽高尺寸不小于300px，图片宽高比要在1:2.5 ~ 2.5:1之间|
|prompt|string|必须|无|正向文本提示词<br><br>- 用<<<xxx>>>的格式来特指某个视频或某张图片，如<<<video_1>>>、<<<image_1>>><br>- 为保证效果，提示词中需包含视频编辑所需的视频和图片（如有），如下文“推荐的Prompt模板”<br>- 不能超过2500个字符<br><br>💡<br><br>推荐的Prompt模板 增加元素<br><br>- 中文：基于<<<video_1>>>中的原始内容，以自然生动的方式，将<<<image_1>>>中的【】，融入<<<video_1>>>的【】<br>- 英文：Using the context of <<<video_1>>>, seamlessly add [x] from <<<image_1>>> 替换元素<br>- 中文：使用<<<image_1>>>中的 【】，替换<<<video_1>>>中的 【】<br>- 英文：swap [x] from <<<image_1>>> for [x] from <<<video_1>>> 删除元素<br>- 中文：删除<<<video_1>>>中的【】<br>- 英文：Delete [x] from <<<video_1>>> 注：中文的【】，英文的[x]，是需要用户填写的部分|
|negative_prompt|string|可选|空|负向文本提示词<br><br>- 不能超过2500个字符|
|mode|string|可选|std|生成视频的模式<br><br>- 枚举值：std，pro<br>- 其中std：标准模式（标准），基础模式，性价比高<br>- 其中pro：专家模式（高品质），高表现模式，生成视频质量更佳|
|duration|string|可选|5|生成视频时长，单位s<br><br>- 枚举值：5，10<br><br>💡<br><br>支持且仅支持生成5s和10s的视频，对于生成不同时长的视频，对输入视频有时长会有所限制：<br><br>- 如生成5s时长视频，输入视频时长需≥2s且≤5s<br>- 如生成10s时长视频，输入视频时长需≥7s且≤10s|
|callback_url|string|可选|空|本次任务结果回调通知地址，如果配置，服务端会在任务状态发生变更时主动通知<br><br>- 具体通知的消息schema见“Callback协议”|
|external_task_id|string|可选|空|自定义任务ID<br><br>- 用户自定义任务ID，传入不会覆盖系统生成的任务ID，但支持通过该ID进行任务查询<br>- 请注意，单用户下需要保证唯一性|

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

`{ 	"code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题   "data":{   	"task_id": "string", //任务ID，系统生成     "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）     "session_id": "id", //会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变     "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms     "updated_at": 1722769557708 //任务更新时间，Unix时间戳、单位ms   } }`

## 查询任务（单个）

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/multi-elements/{id}|GET|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求体

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|task_id|string|可选|空|多图参考生视频的任务ID<br><br>- 请求路径参数，直接将值填写在请求路径中，与external_task_id两种查询方式二选一|
|external_task_id|string|可选|空|多图参考生视频的自定义任务ID<br><br>- 创建任务时填写的external_task_id，与task_id两种查询方式二选一|

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

`{ 	"code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题   "data":{   	"task_id": "string", //任务ID，系统生成     "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）     "task_status_msg": "string", //任务状态信息，当任务失败时展示失败原因（如触发平台的内容风控等）     "task_info": { //任务创建时的参数信息       "external_task_id": "string"//客户自定义任务ID     },     "task_result":{       "videos":[         {         	"id": "string", //生成的视频ID；全局唯一   			  "session_id": "id", //会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变，有效期24小时          		"url": "string", //生成视频的URL，例如https://p1.a.kwimgs.com/bs2/upload-ylab-stunt/special-effect/output/HB1_PROD_ai_web_46554461/-2878350957757294165/output.mp4（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）       		"duration": "string" //视频总时长，单位s         }       ]     },     "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms     "updated_at": 1722769557708, //任务更新时间，Unix时间戳、单位ms   } }`

## 查询任务（列表）

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/multi-elements/|GET|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 查询参数

/v1/videos/multi-image2video?pageNum=1&pageSize=30

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|pageNum|int|可选|1|页码<br><br>- 取值范围：[1,1000]|
|pageSize|int|可选|30|每页数据量<br><br>- 取值范围：[1,500]|

### 请求体

无

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

`{ 	"code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题   "data":{[   	"task_id": "string", //任务ID，系统生成     "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）     "task_status_msg": "string", //任务状态信息，当任务失败时展示失败原因（如触发平台的内容风控等）     "task_info": { //任务创建时的参数信息       "external_task_id": "string"//客户自定义任务ID     },     "task_result":{       "videos":[         {         	"id": "string", //生成的视频ID；全局唯一   			  "session_id": "id", //会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变，有效期24小时           		"url": "string", //生成视频的URL，例如https://p1.a.kwimgs.com/bs2/upload-ylab-stunt/special-effect/output/HB1_PROD_ai_web_46554461/-2878350957757294165/output.mp4（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）       		"duration": "string" //视频总时长，单位s         }       ]     },     "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms     "updated_at": 1722769557708, //任务更新时间，Unix时间戳、单位ms   }] }`




# 视频延长

## 创建任务

注-1：视频延长是指对文生/图生视频结果进行时间上的延长，单次可延长4~5s，使用的模型和模式不可选择、与源视频相同

注-2：被延长后的视频可以再次延长，但总视频时长不能超过3min

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/video-extend|POST|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求体

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|video_id|string|必须|无|视频ID<br><br>- 支持通过文本、图片和视频延长生成的视频的ID（原视频不能超过3分钟）<br><br>请注意，基于目前的清理策略、视频生成30天之后会被清理，则无法进行延长|
|prompt|string|可选|无|正向文本提示词  <br>不能超过2500个字符词|
|negative_prompt|string|可选|无|负向文本提示词  <br>不能超过2500个字符|
|cfg_scale|float|可选|0.5|提示词参考强度  <br>取值范围：[0,1]，数值越大参考强度越大|
|callback_url|string|可选|无|本次任务结果回调通知地址，如果配置，服务端会在任务状态发生变更时主动通知  <br>具体通知的消息schema见“Callback协议”|

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

`{   "code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题   "data": {     "task_id": "string", //任务ID，系统生成     "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）     "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms     "updated_at": 1722769557708 //任务更新时间，Unix时间戳、单位ms   } }`

## 查询任务（单个）

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/video-extend/{id}|GET|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求路径参数

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|task_id|string|必须|无|视频续写的任务ID  <br>请求路径参数，直接将值填写在请求路径中|

### 请求体

无

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

28

`{   "code": 0, //错误码；具体定义见1.1错误码   "message": "string", //错误信息；具体定义见1.1错误码   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题；全局唯一   "data":{   	"task_id": "string", //任务ID，系统生成；全局唯一     "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）     "task_status_msg": "string", //任务状态信息，当任务失败时展示失败原因（如触发平台的内容风控等）     "task_info":{ //任务创建时的参数信息        "parent_video": {          	"id": "string", //续写前的视频ID；全局唯一       		"url": "string", //续写前视频的URL（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）       		"duration": "string" //续写前的视频总时长，单位s        }     }, //任务创建时用户填写的详细信息     "task_result":{       "videos":[  //数组是为了保留扩展性，以防未来要支持n         {           "id": "string", //续写后的完整视频ID；全局唯一           "url": "string", //续写后视频的URL           "duration": "string" //视频总时长，单位s         }       ]     }     "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms     "updated_at": 1722769557708, //任务更新时间，Unix时间戳、单位ms   } }`

## 查询任务（列表）

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/video-extend|GET|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 查询参数

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|pageNum|int|可选|1|页码  <br>取值范围：[1,1000]|
|pageSize|int|可选|30|每页数据量  <br>取值范围：[1,500]|

### 请求体

无

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

28

29

30

`{   "code": 0, //错误码；具体定义见1.1错误码   "message": "string", //错误信息；具体定义见1.1错误码   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题；全局唯一   "data":[     {       "task_id": "string", //任务ID，系统生成；全局唯一       "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）       "task_status_msg": "string", //任务状态信息，当任务失败时展示失败原因（如触发平台的内容风控等）       "task_info":{ //任务创建时的参数信息         "parent_video": {           "id": "string", //续写前的视频ID；全局唯一           "url": "string", //续写前视频的URL（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）           "duration": "string" //续写前的视频总时长，单位s         }       }, //任务创建时用户填写的详细信息       "task_result":{         "videos":[  //数组是为了保留扩展性，以防未来要支持n           {             "id": "string", //续写后的完整视频ID；全局唯一             "url": "string", //续写后视频的URL（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）             "duration": "string" //视频总时长，单位s           }         ]       },       "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms       "updated_at": 1722769557708, //任务更新时间，Unix时间戳、单位ms     }   ] }`

# 对口型

## 创建任务

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/lip-sync|POST|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求体

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|input|object|必须|空|包含多个字段，用于指定视频、口型对应内容等|
|input<br><br>- video_id|string|必须|无|通过可灵AI生成的视频的ID<br><br>- 用于指定视频、判断视频是否可用于对口型服务<br>- 与input·video_url参数二选一填写，不能同时为空，也不能同时有值<br>- 仅支持使用30天内生成的时长不超过60秒的视频|
|input<br><br>- video_url|string|必须|无|所上传视频的获取链接<br><br>- 用于指定视频，并判断视频是否可用于对口型服务<br>- 与input·video_id参数二选一填写，不能同时为空，也不能同时有值<br>- 视频文件支持.mp4/.mov，文件大小不超过100MB，视频时长不超过60s且不短于2s，仅支持720p和1080p、长宽的边长均位于512px~2160px之间，上述校验不通过会返回错误码等信息<br>- 系统会校验视频内容，如有问题会返回错误码等信息|
|input<br><br>- mode|string|必须|无|生成视频的模式<br><br>- 枚举值：text2video，audio2video<br>    - text2video：文本生成视频模式，此模式时input·text、input·voice_id、input·voice_language参数为必填；音频生成视频模式相关参数无效<br>    - audio2video：音频生成视频模式，此模式时input·audio_type参数为必填，文本生成视频模式相关参数无效|
|input<br><br>- text|string|可选|无|生成对口型视频的文本内容<br><br>- input·mode参数值为text2video时，当前参数必填<br>- 文本内容最大长度120，内容过长会返回错误码等信息<br>- 系统会校验文本内容，如有问题会返回错误码等信息|
|input<br><br>- voice_id|string|可选|无|音色ID<br><br>- input·mode参数值为text2video时，当前参数必填<br>- 系统提供多种音色可供选择，具体音色效果、音色ID、音色语种对应关系[点此查看](https://docs.qingque.cn/s/home/eZQDvafJ4vXQkP8T9ZPvmye8S?identityId=2E3S0NySBQy)；音色试听不支持自定义文案<br>- 音色试听文件命名规范：音色名称#音色ID#音色语种|
|input<br><br>- voice_language|string|可选|zh|音色语种，与音色ID对应，详见<br><br>- 枚举值：zh，en<br>- input·mode参数值为text2video时，当前参数必填<br>- 音色语种与音色ID对应，详见上文|
|input<br><br>- voice_speed|float|可选|1.0|语速<br><br>- 有效范围：0.8~2.0，精确至小数点后1位，超出部分将自动四舍五入<br>- input·mode参数值为text2video时，当前参数必填|
|input<br><br>- audio_type|string|可选|无|使用音频文件生成对口型视频时，传输音频文件的方式<br><br>- 枚举值：file，url<br>    <br>    - file：上传文件模式，此时input·audio_file参数必填<br>    - url：提供下载链接模式，此时input·audio_url参数必填<br>- input·mode参数值为audio2video时，当前参数必填|
|input<br><br>- audio_file|string|可选|无|音频文件本地路径<br><br>- input·audio_type参数值为file时，当前参数必填<br>- 音频文件支持.mp3/.wav/.m4a/.aac，文件大小不超过5MB，Base64编码，格式不匹配或文件过大会返回错误码等信息<br>- 系统会校验音频内容，如有问题会返回错误码等信息|
|input<br><br>- audio_url|string|可选|无|音频文件下载url<br><br>- input·audio_type参数值为url时，当前参数必填<br>- 音频文件支持.mp3/.wav/.m4a/.aac，文件大小不超过5MB，格式不匹配或文件过大会返回错误码等信息<br>- 系统会校验音频内容，如有问题会返回错误码等信息|
|callback_url|string|可选|无|本次任务结果回调通知地址，如果配置，服务端会在任务状态发生变更时主动通知<br><br>- 具体通知的消息schema见“Callback协议”|

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

`{   "code": 0, //错误码；具体定义见错误码   "message": "string", //错误信息   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题   "data": {     "task_id": "string", //任务ID，系统生成     "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）     "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms     "updated_at": 1722769557708 //任务更新时间，Unix时间戳、单位ms   } }`

## 查询任务（单个）

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/lip-sync/{id}|GET|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 请求路径参数

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|task_id|string|必须|无|对口型的任务ID  <br>请求路径参数，直接将值填写在请求路径中|

### 请求体

无

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

28

`{ 	"code": 0, //错误码；具体定义见1.1错误码   "message": "string", //错误信息；具体定义见1.1错误码   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题；全局唯一   "data":{     	"task_id": "string", //任务ID，系统生成；全局唯一       "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）       "task_status_msg": "string", //任务状态信息，当任务失败时展示失败原因（如触发平台的内容风控等）       "task_info":{ //任务创建时的参数信息         "parent_video": {          	"id": "string", //原视频ID；全局唯一       		"url": "string", //原视频的URL（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）       		"duration": "string" //原视频总时长，单位s         }       }, //任务创建时用户填写的详细信息       "task_result":{         "videos":[  //数组是为了保留扩展性，以防未来要支持n           {             "id": "string", //视频ID；全局唯一             "url": "string", //对口型视频的URL（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）             "duration": "string" //对口型视频总时长，单位s           }         ]     	},       "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms       "updated_at": 1722769557708 //任务更新时间，Unix时间戳、单位ms    } }`

## 查询任务（列表）

|网络协议|请求地址|请求方法|请求格式|响应格式|
|---|---|---|---|---|
|https|/v1/videos/lip-sync|GET|application/json|application/json|

### 请求头

|字段|值|描述|
|---|---|---|
|Content-Type|application/json|数据交换格式|
|Authorization|鉴权信息，参考接口鉴权|鉴权信息，参考接口鉴权|

### 查询参数

/v1/videos/lip-sync?pageNum=1&pageSize=30

|字段|类型|必填|默认值|描述|
|---|---|---|---|---|
|pageNum|int|可选|1|页码  <br>取值范围：[1,1000]|
|pageSize|int|可选|30|每页数据量  <br>取值范围：[1,500]|

### 请求体

无

### 响应体

JSON

复制

折叠

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

28

29

`{   "code": 0, //错误码；具体定义见1.1错误码   "message": "string", //错误信息；具体定义见1.1错误码   "request_id": "string", //请求ID，系统生成，用于跟踪请求、排查问题；全局唯一   "data":[     {       "task_id": "string", //任务ID，系统生成；全局唯一       "task_status": "string", //任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）       "task_status_msg": "string", //任务状态信息，当任务失败时展示失败原因（如触发平台的内容风控等）       "task_info":{ //任务创建时的参数信息         "parent_video": {          	"id": "string", //原视频ID；全局唯一       		"url": "string", //原视频的URL（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）       		"duration": "string" //原视频总时长，单位s         }       }, //任务创建时用户填写的详细信息       "task_result":{         "videos":[  //数组是为了保留扩展性，以防未来要支持n           {             "url": "string", //对口型视频的URL（请注意，为保障信息安全，生成的图片/视频会在30天后被清理，请及时转存）             "duration": "string" //对口型视频总时长，单位s           }         ]     	}       "created_at": 1722769557708, //任务创建时间，Unix时间戳、单位ms       "updated_at": 1722769557708, //任务更新时间，Unix时间戳、单位ms     }   ] }`