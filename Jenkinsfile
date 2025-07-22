pipeline {
    agent any
    
    tools {
        maven 'Maven-3.9.4'
        jdk 'JDK-17'
    }
    
    environment {
        APP_NAME = 'aicamping'
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
                sh 'mvn clean compile'
            }
        }
        
        stage('Test') {
            steps {
                echo '=== Running Tests ==='
                sh 'mvn test'
            }
            post {
                always {
                    publishTestResults(
                        testResultsPattern: 'target/surefire-reports/*.xml',
                        allowEmptyResults: true
                    )
                }
            }
        }
        
        stage('Package') {
            steps {
                echo '=== Creating WAR Package ==='
                sh 'mvn clean package -DskipTests'
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
            echo '=== Cleaning Workspace ==='
            cleanWs()
        }
        success {
            echo '=== Build and Package Successful! ==='
        }
        failure {
            echo '=== Build Failed! ==='
        }
    }
}
