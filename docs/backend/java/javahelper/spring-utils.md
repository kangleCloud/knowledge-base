# Spring框架工具包

Spring框架中的工具包


## 集合判空
org.springframework.util.CollectionUtils
```java
Map map = null;
// 会判断是否为null值或集合size=0
if (CollectionUtils.isEmpty(map)){
   return true;
}
```

## Http请求工具

http请求工具建议RestTemplate，兼容各种场景和模式，无论是请求远程接口，还是远程图片稳定性都比较好。

org.springframework.web.client.RestTemplate

**使用示例**

```java
RestTemplate restTemplate = new RestTemplate();
```

###  get请求

```java
String url = "http://wwww.baidu.com";
ResponseEntity<String> responseEntity = restTemplate.getForEntity(url, String.class);
log.info("restTemplate post json响应body:{}", responseEntity.getBody());
```

### post formdata

```java
HttpHeaders headers = request.getHeaders();
headers.add("Content-Type", MediaType.APPLICATION_FORM_URLENCODED_VALUE);
MultiValueMap<String, Object> params = new LinkedMultiValueMap<>();
HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(params, headers);
ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);
log.info("restTemplate post form响应body:{}", responseEntity.getBody());
```

### post json

```java
HttpHeaders headers = request.getHeaders();
headers.add("Content-Type", MediaType.APPLICATION_JSON_VALUE);
String url = "http://www.baidu.com";
String json = "{\"age\":18}";
HttpEntity<String> requestEntity = new HttpEntity<>(json, headers);
ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);
log.info("restTemplate post form响应body:{}", responseEntity.getBody());
```







