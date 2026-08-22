pipeline {
    agent any

    stages {

        stage('Backend Install') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Backend Test') {
            steps {
                dir('backend') {
                    sh 'node --check server.js'
                }
            }
        }

        stage('Backend Audit') {
            steps {
                dir('backend') {
                    sh 'npm audit --audit-level=high || true'
                }
            }
        }

        stage('Build Backend') {
            steps {
                sh 'docker build -t digital-land-record:${BUILD_NUMBER} -f backend/Dockerfile backend'
            }
        }

        stage('Deploy Backend') {
            steps {
                sh '''
                    docker rm -f digital_land_app || true

                    docker run -d \
                        --name digital_land_app \
                        -p 5000:5000 \
                        -e PORT=5000 \
                        -e NODE_ENV=production \
                        digital-land-record:${BUILD_NUMBER}
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build -t digital-land-frontend:${BUILD_NUMBER} -f frontend/Dockerfile frontend'
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh '''
                    docker rm -f digital_land_frontend || true

                    docker run -d \
                        --name digital_land_frontend \
                        -p 3000:80 \
                        digital-land-frontend:${BUILD_NUMBER}
                '''
            }
        }

        stage('Smoke Test') {
    steps {
        sh '''
            echo "Waiting for containers..."
            sleep 5

            echo "Checking frontend..."
            curl -f http://host.docker.internal:3000

            echo "Frontend is working!"

            echo "Checking backend..."
            curl -s http://host.docker.internal:5000

            echo "Backend is responding!"

            echo "Smoke test passed!"
        '''
    }
}