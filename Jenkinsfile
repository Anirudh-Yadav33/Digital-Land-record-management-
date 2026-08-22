pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                sh 'node --check server.js'
            }
        }

        stage('Code Quality') {
            steps {
                sh 'npm audit --audit-level=high || true'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t digital-land-record:${BUILD_NUMBER} .'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker rm -f digital_land_app || true
                    docker run -d \
                      --name digital_land_app \
                      -p 3000:3000 \
                      -e PORT=3000 \
                      -e NODE_ENV=production \
                      digital-land-record:${BUILD_NUMBER}
                '''
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    sleep 5
                    curl -f http://localhost:3000 || exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'CI/CD Pipeline completed successfully!'
        }

        failure {
            echo 'CI/CD Pipeline failed.'
        }
    }
}
