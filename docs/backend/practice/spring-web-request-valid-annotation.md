
# SpringWeb请求校验注解
###  1. **引言** 

- Spring MVC是一种广泛用于构建Web应用程序的框架，提供了丰富的功能来简化开发过程。
- 请求参数的有效性和合法性对于保障系统的稳定性和安全性至关重要。

### 2. **JSR 303（Bean Validation）概述** 

- JSR 303是Java中的Bean Validation规范，定义了一组注解，用于对JavaBean进行校验。
- 这些注解可以应用于字段、方法参数、方法返回值等，提供了强大而灵活的校验机制。

### 3. **Spring中的请求参数校验**

- Spring框架通过整合JSR 303规范，提供了一套用于请求参数校验的注解。
- 核心注解包括：@NotNull、@NotEmpty、@NotBlank、@Min、@Max、@Email等。

#### 3.1. **@NotNull注解**

- 用于检查被注解的元素值不为null。

- 示例：

  ```java
  @PostMapping("/example")
  public ResponseEntity<String> exampleMethod(@NotNull @RequestBody String data) {
      // 方法体
  }
  ```

#### 3.2. **@NotEmpty注解**

- 用于检查被注解的元素值不为null且长度不为0（对于字符串），或者集合不为空。

- 示例：

  ```java
  @PostMapping("/example")
  public ResponseEntity<String> exampleMethod(@NotEmpty @RequestBody String data) {
      // 方法体
  }
  ```

#### 3.3.  **@NotBlank注解**

- 用于检查被注解的元素值不为null且去除首尾空格后长度不为0（对于字符串）。

- 示例：

  ```java
  @PostMapping("/example")
  public ResponseEntity<String> exampleMethod(@NotBlank @RequestParam String username) {
      // 方法体
  }
  ```

#### 3.4.  **@Min和@Max注解**

- 用于检查数字是否大于等于最小值或小于等于最大值。

- 示例：

  ```java
  @PostMapping("/example")
  public ResponseEntity<String> exampleMethod(@Min(18) @RequestParam int age) {
      // 方法体
  }
  ```

#### 3.5.  **@Email注解**

- 用于检查字符串是否是一个合法的邮箱地址。

- 示例：

  ```java
  @PostMapping("/example")
  public ResponseEntity<String> exampleMethod(@Email @RequestParam String email) {
      // 方法体
  }
  ```

### 4. **Spring Boot中的校验配置完整实例**

使用 Spring Boot 和 Spring MVC 来展示请求参数校验的工程级别示例。下面是一个简单的示例代码，演示了如何使用校验注解进行用户注册参数的验证。

首先，确保你的项目中引入了 Spring Boot Starter Web 和 Hibernate Validator（它是 JSR 303 的实现之一）的依赖。

```xml
<!-- pom.xml -->
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Hibernate Validator -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

然后，创建一个用户注册的 Controller 类：

```java
import javax.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        // 在这里处理用户注册逻辑
        // 如果参数验证失败，会抛出 MethodArgumentNotValidException 异常

        return ResponseEntity.ok("User registered successfully!");
    }
}
```

接下来，定义一个用户注册请求的 DTO（Data Transfer Object）类，其中包含需要校验的字段：

```java
import javax.validation.constraints.Email;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

public class UserRegistrationRequest {

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "\\d{10}", message = "Invalid phone number format. Must be 11 digits.")
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "Age is required")
    @Min(value = 18, message = "Age must be at least 18")
    private Integer age;

    // Getters and setters

}

```

在这个例子中，`UserRegistrationRequest` 类包含了手机号、密码、邮箱和年龄字段，并使用了校验注解来定义各字段的校验规则。

在 `UserController` 中，通过 `@Valid`或者`@Validated` 注解标注在方法参数上，Spring MVC 会在调用方法前执行参数校验。如果校验失败，将会抛出异常，你可以通过异常处理机制进行处理。



### **5. 创建自定义注解**

当希望进行更复杂的自定义注解校验时，通常会使用 `ConstraintValidator` 接口。`ConstraintValidator` 接口允许你在校验过程中执行更灵活的逻辑。以下是一个简单的示例，演示如何创建自定义注解，并使用 `ConstraintValidator` 进行校验。

首先，定义一个自定义的注解 `ValidPhoneNumber`：

```java
import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneNumberValidator.class)
public @interface ValidPhoneNumber {
    String message() default "Invalid phone number format";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

接下来，实现 `ConstraintValidator` 接口的 `PhoneNumberValidator` 类：

```java
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    @Override
    public void initialize(ValidPhoneNumber constraintAnnotation) {
    }

    @Override
    public boolean isValid(String phoneNumber, ConstraintValidatorContext context) {
        // 这里执行具体的校验逻辑
        // 示例：简单判断是否是11位数字
        return phoneNumber != null && phoneNumber.matches("\\d{11}");
    }
}
```

在这个例子中，我们创建了 `ValidPhoneNumber` 注解，并通过 `@Constraint(validatedBy = PhoneNumberValidator.class)` 指定了用于校验的 `PhoneNumberValidator` 类。`PhoneNumberValidator` 实现了 `ConstraintValidator<ValidPhoneNumber, String>` 接口，其中 `ValidPhoneNumber` 表示注解的类型，`String` 表示要验证的目标类型。

现在，你可以在你的实体类中使用 `@ValidPhoneNumber` 注解来验证手机号：

```java
public class User {
    @ValidPhoneNumber
    private String phoneNumber;

    // getters and setters
}
```

在这个例子中，如果 `phoneNumber` 不是11位数字，校验就会失败。

这种方式相较于 `AnnotationProcessor` 更为灵活，可以实现更加复杂的校验逻辑，并且集成到 JSR 303 校验框架中。这种方法更适合于对自定义注解进行更复杂处理的场景。



### 6. **常见问题和解决方法**

- 在处理常见的校验错误和异常时，主要涉及到 Spring Boot 中的请求参数校验。当使用 `@Valid` 或 `@Validated` 进行参数校验时，常见的错误和异常可以通过以下方式进行处理：

    **自定义全局异常处理器：**

  - 创建一个全局异常处理器，捕获 `MethodArgumentNotValidException` 异常。

  ```java
  import org.springframework.http.ResponseEntity;
  import org.springframework.web.bind.MethodArgumentNotValidException;
  import org.springframework.web.bind.annotation.ExceptionHandler;
  import org.springframework.web.bind.annotation.RestControllerAdvice;
  
  @RestControllerAdvice
  public class GlobalExceptionHandler {
  
      @ExceptionHandler(MethodArgumentNotValidException.class)
      public ResponseEntity<String> handleValidationException(MethodArgumentNotValidException ex) {
          List<FieldError> fieldErrors = ex.getBindingResult().getFieldErrors();
          // 处理错误信息，例如返回自定义错误格式
          return ResponseEntity.badRequest().body("Validation failed: " + fieldErrors.get(0).getDefaultMessage());
      }
  }
  ```
  
  - 通过以上方法，你可以更灵活地处理请求参数校验失败的情况。选择适合你需求的方法，可以返回详细的错误信息，或者根据不同的场景进行定制化处理。确保全局异常处理器能够捕获到校验失败的异常，并根据具体情况做出合适的响应。

