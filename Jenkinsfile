pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

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

        stage('Build Backend Docker') {
            steps {
                sh '''
                    docker build \
                      -t digital-land-record:${BUILD_NUMBER} \
                      -f backend/Dockerfile \
                      backend
                '''
            }
        }

        stage('Deploy Backend') {
            steps {
                sh '''
                    docker rm -f digital_land_app || true

                    OLD_CONTAINERS=$(docker ps -aq --filter "publish=5000")

                    if [ -n "$OLD_CONTAINERS" ]; then
                        docker rm -f $OLD_CONTAINERS
                    fi

                    docker run -d \
                      --name digital_land_app \
                      -p 5000:5000 \
                      -e PORT=5000 \
                      -e NODE_ENV=production \
                      digital-land-record:${BUILD_NUMBER}
                '''
            }
        }

        stage('Build Frontend Docker') {
            steps {
                sh '''
                    docker build \
                      -t digital-land-frontend:${BUILD_NUMBER} \
                      -f frontend/Dockerfile \
                      frontend
                '''
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh '''
                    echo "Stopping old frontend..."

                    docker rm -f digital_land_frontend || true

                    OLD_FRONTEND=$(docker ps -aq --filter "publish=3000")

                    if [ -n "$OLD_FRONTEND" ]; then
                        docker rm -f $OLD_FRONTEND
                    fi

                    echo "Starting new frontend..."

                    docker run -d \
                      --name digital_land_frontend \
                      -p 3000:80 \
                      digital-land-frontend:${BUILD_NUMBER}

                    echo "Frontend deployed successfully!"
                '''
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    echo "Waiting for applications..."
                    sleep 5

                    echo "Testing frontend..."

                    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://host.docker.internal:3000)

                    echo "Frontend HTTP response: $HTTP_CODE"

                    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then
                        echo "Frontend smoke test passed!"
                    else
                        echo "Frontend smoke test failed!"
                        exit 1
                    fi

                    echo "Testing backend..."

                    BACKEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://host.docker.internal:5000)

                    echo "Backend HTTP response: $BACKEND_CODE"

                    if [ "$BACKEND_CODE" -ge 200 ] && [ "$BACKEND_CODE" -lt 500 ]; then
                        echo "Backend smoke test passed!"
                    else
                        echo "Backend smoke test failed!"
                        exit 1
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo 'CI/CD Pipeline completed successfully!'
            echo 'Frontend deployed at http://localhost:3000'
            echo 'Backend deployed at http://localhost:5000'
        }

        failure {
            echo 'CI/CD Pipeline failed.'
        }
    }
}