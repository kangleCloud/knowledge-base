# Nexus私仓使用
Nexus私仓"通常指的是Sonatype Nexus Repository Manager，它是一个用于管理和组织软件构建产物（如Java JAR文件、Maven构建、Docker容器等）的仓库管理工具。

## Nexus的使用优势
* 依赖管理： Nexus私仓允许你存储和管理项目的依赖项，例如Maven构建中的依赖JAR包。通过在本地存储这些依赖项，你的构建过程可以更快速和可靠，因为不需要每次都从远程仓库下载依赖。

* 构建缓存： Nexus可以缓存远程仓库中的构建产物，减少对外部资源的依赖。这有助于提高构建的效率，并减少对外部仓库的依赖性。

* 安全审查： Nexus私仓可以用于存储和审查组织内部使用的软件包。这有助于确保软件的安全性，因为你可以控制哪些软件包被引入到你的项目中，以及审查它们的来源和质量。

* 版本控制： Nexus允许你版本控制和管理软件包，确保项目在不同版本之间的稳定性和一致性。

* 本地部署： 对于没有互联网连接或需要在内部网络环境中工作的项目，Nexus私仓可以作为一个本地存储库，提供对所需软件包的内部访问。

* 支持多种仓库类型： Nexus支持多种仓库类型，包括Maven、npm、Docker等。这意味着你可以在同一个平台上管理多种类型的构建产物。

* 用户权限管理： Nexus允许你设置用户权限，控制对不同仓库的访问权。这有助于确保只有经过授权的人员能够访问和管理仓库中的内容。


## 私仓的使用维护方式
### 使用者
作为使用者在公司应该如何在项目中使用maven私仓

* 修改项目`pom.xml`文件

```xml
    <properties>
		...
        <sjfy.version>1.0-SNAPSHOT</sjfy.version>
		...
    </properties>

    <dependencies>
        ...
        <dependency>
            <groupId>cn.chinacici</groupId>
            <!-- 内部开发的starter -->
            <artifactId>xxx-starter</artifactId>
            <version>${sjfy.version}</version>
        </dependency>
        ...
    </dependencies>
```

* 修改本地maven的`setting.xml`文件

```xml

<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">

  ...

  <servers>
    <server>
      <id>sjfy-nexus</id>
      <username>${USERNAME}</username>
      <password>${PASSWORD}</password>
    </server>
  </servers>

  <mirrors>
    <mirror>
      <id>sjfy-nexus</id>
      <mirrorOf>*</mirrorOf>
      <url>https://nexus.chinacici.com/repository/maven-public/</url>
    </mirror>
  </mirrors>

  <profiles>
    <profile>
        <id>jdk1.8</id>
        <activation>
            <activeByDefault>true</activeByDefault>
            <jdk>1.8</jdk>
        </activation>
        <properties>
            <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
            <maven.compiler.source>1.8</maven.compiler.source>
            <maven.compiler.target>1.8</maven.compiler.target>
            <maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>
        </properties>
    </profile>
    <profile>
      <id>sjfy-nexus</id>
      <repositories>
          <repository>
          <id>central</id>
          <url>https://nexus.chinacici.com/repository/maven-public/</url>
          <releases><enabled>true</enabled></releases>
          <snapshots><enabled>true</enabled></snapshots>
          </repository>
      </repositories>
      <pluginRepositories>
          <pluginRepository>
          <id>central</id>
          <url>https://nexus.chinacici.com/repository/maven-public/</url>
          <releases><enabled>true</enabled></releases>
          <snapshots><enabled>true</enabled></snapshots>
          </pluginRepository>
      </pluginRepositories>
    </profile>
  </profiles>

  <activeProfiles>
      <activeProfile>jdk1.8</activeProfile>
      <activeProfile>sjfy-nexus</activeProfile>
  </activeProfiles>

</settings>

```



### 维护者
作为sdk维护者在公司应该如何在项目中使用maven私仓
* 修改`java-sdk`项目的`pom.xml`文件

```xml
	...    
	<groupId>cn.chinacici</groupId>
    <artifactId>private-starters</artifactId>
    <packaging>pom</packaging>
    <version>1.0-SNAPSHOT</version>

    <modules>
        <!-- 内部开发的starter模块 -->
        <module>xxx-starter</module>
    </modules>

    <distributionManagement>
        <repository>
            <id>sjfy-nexus</id>
            <name>sjfy-nexus-releases</name>
            <url>https://nexus.chinacici.com/repository/maven-releases/</url>
        </repository>
        <snapshotRepository>
            <id>sjfy-nexus</id>
            <name>sjfy-nexus-snapshots</name>
            <url>https://nexus.chinacici.com/repository/maven-snapshots/</url>
        </snapshotRepository>
    </distributionManagement>
	...
```

* 修改本地maven的`setting.xml`文件
`setting.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">

  ...

  <servers>
    <server>
      <id>sjfy-nexus</id>
      <username>${USERNAME}</username>
      <password>${PASSWORD}</password>
    </server>
  </servers>

  <mirrors>
    <mirror>
      <id>sjfy-nexus</id>
      <mirrorOf>*</mirrorOf>
      <url>https://nexus.chinacici.com/repository/maven-public/</url>
    </mirror>
  </mirrors>

  <profiles>
    <profile>
        <id>jdk1.8</id>
        <activation>
            <activeByDefault>true</activeByDefault>
            <jdk>1.8</jdk>
        </activation>
        <properties>
            <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
            <maven.compiler.source>1.8</maven.compiler.source>
            <maven.compiler.target>1.8</maven.compiler.target>
            <maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>
        </properties>
    </profile>
    <profile>
      <id>sjfy-nexus</id>
      <repositories>
          <repository>
          <id>central</id>
          <url>https://nexus.chinacici.com/repository/maven-public/</url>
          <releases><enabled>true</enabled></releases>
          <snapshots><enabled>true</enabled></snapshots>
          </repository>
      </repositories>
      <pluginRepositories>
          <pluginRepository>
          <id>central</id>
          <url>https://nexus.chinacici.com/repository/maven-public/</url>
          <releases><enabled>true</enabled></releases>
          <snapshots><enabled>true</enabled></snapshots>
          </pluginRepository>
      </pluginRepositories>
    </profile>
  </profiles>

  <activeProfiles>
      <activeProfile>jdk1.8</activeProfile>
      <activeProfile>sjfy-nexus</activeProfile>
  </activeProfiles>

</settings>

```

## 总结
Nexus Repository Manager是一款广泛应用于Maven项目的仓库管理工具，通过提供本地、远程和虚拟仓库的灵活管理，有效支持构建过程，缓存远程依赖以提高构建速度。其强调依赖管理，发布和部署方面提供便捷机制，实现安全审查和用户权限管理，确保项目的可靠性和安全性。Nexus的多仓库类型支持使其成为通用的构建产物管理工具，全面功能帮助团队更好地组织、管理构建产物，提高效率。