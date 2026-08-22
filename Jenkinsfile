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
                    docker build -t digital-land-record:${BUILD_NUMBER} \
                    -f backend/Dockerfile backend
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    echo "Stopping existing application..."

                    docker rm -f digital_land_app || true
                    docker rm -f digital_land_backend || true
                    docker rm -f digital-land-backend || true

                    echo "Removing any container using port 5000..."

                    OLD_CONTAINERS=$(docker ps -aq --filter "publish=5000")

                    if [ -n "$OLD_CONTAINERS" ]; then
                        docker rm -f $OLD_CONTAINERS
                    fi

                    echo "Starting new application..."

                    docker run -d \
                      --name digital_land_app \
                      -p 5000:5000 \
                      -e PORT=5000 \
                      -e NODE_ENV=production \
                      digital-land-record:${BUILD_NUMBER}

                    echo "Application deployed successfully!"
                '''
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    echo "Waiting for application..."
                    sleep 5

                    echo "Testing application..."

                    curl -f http://host.docker.internal:5000 || exit 1

                    echo "Smoke test passed!"
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