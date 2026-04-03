#!/bin/bash
export JAVA_HOME="$(dirname "$0")/.jdk/jdk-25.0.2+10"
export PATH="$JAVA_HOME/bin:$PATH"
mvn spring-boot:run
