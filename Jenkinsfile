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
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    sh 'node --check server.js'
                }
            }
        }

        stage('Code Quality') {
            steps {
                dir('backend') {
                    sh 'npm audit --audit-level=high || true'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build -t digital-land-record:${BUILD_NUMBER} -f backend/Dockerfile backend
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker rm -f digital_land_app || true
                    docker rm -f digital_land-backend || true

                    docker run -d \
                      --name digital_land_app \
                      -p 5000:5000 \
                      -e PORT=5000 \
                      -e NODE_ENV=production \
                      digital-land-record:${BUILD_NUMBER}
                '''
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    sleep 5
                    curl -f http://localhost:5000 || exit 1
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