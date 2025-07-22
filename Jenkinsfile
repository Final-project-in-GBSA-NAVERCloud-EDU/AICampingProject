pipeline {
    agent any
    
    tools {
        maven 'Maven-3.9.4'
        jdk 'JDK-8'  // Java 8 사용
    }
    
    stages {
        stage('Git Checkout') {
            steps {
                echo '=== Git Repository Checkout ==='
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                echo '=== Maven Build Start ==='
                sh 'mvn clean compile -Dmaven.compiler.source=1.8 -Dmaven.compiler.target=1.8'
            }
        }
        
        stage('Test') {
            steps {
                echo '=== Running Tests ==='
                sh 'mvn test -Dmaven.compiler.source=1.8 -Dmaven.compiler.target=1.8'
            }
        }
        
        stage('Package') {
            steps {
                echo '=== Creating WAR Package ==='
                sh 'mvn clean package -DskipTests -Dmaven.compiler.source=1.8 -Dmaven.compiler.target=1.8'
            }
            post {
                success {
                    archiveArtifacts artifacts: 'target/*.war', fingerprint: true
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo '=== Build Success! ==='
        }
        failure {
            echo '=== Build Failed! ==='
        }
    }
}
