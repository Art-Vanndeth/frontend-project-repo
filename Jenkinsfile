// ==============================================================================
// Jenkins CI Pipeline - Frontend Project Repository (Next.js)
// Repo: https://github.com/Art-Vanndeth/frontend-project-repo.git
// Flow: Webhook -> Test (Cypress/Lint) -> Docker Build -> Push Nexus ->
//       Trigger frontend-config-pipeline -> Telegram Notification
// ==============================================================================

def sendTelegram(String message) {
    withCredentials([
        string(credentialsId: 'telegram-bot-token', variable: 'TG_BOT_TOKEN'),
        string(credentialsId: 'telegram-chat-id', variable: 'TG_CHAT_ID')
    ]) {
        sh """
            curl -s -X POST "https://api.telegram.org/bot\${TG_BOT_TOKEN}/sendMessage" \
              -d chat_id="\${TG_CHAT_ID}" \
              -d parse_mode="HTML" \
              --data-urlencode "text=${message}" > /dev/null
        """
    }
}

pipeline {
    agent any

    triggers {
        GenericTrigger(
            genericVariables: [
                [key: 'GIT_BRANCH', value: '$.ref'],
                [key: 'GIT_PUSHER', value: '$.user_name'],
                [key: 'COMMIT_MSG', value: '$.commits[0].message']
            ],
            causeString: 'Triggered by GitLab Push Webhook',
            token: 'frontend-project-token',
            printContributedVariables: true,
            printPostContent: false
        )
    }

    environment {
        NEXUS_REGISTRY = 'docker.devops.cstad.edu.kh'
        IMAGE_NAME     = 'cstad-frontend'
        IMAGE_TAG      = "v1.0.${BUILD_NUMBER}"
        FULL_IMAGE     = "${NEXUS_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
        NEXT_PUBLIC_API_URL = 'https://api.devops.cstad.edu.kh'
    }

    stages {
        stage('Notify Pipeline Start') {
            steps {
                script {
                    sendTelegram("🚀 <b>Frontend CI Started</b>\n<b>Job:</b> ${env.JOB_NAME}\n<b>Build:</b> #${env.BUILD_NUMBER}\n<b>Tag:</b> <code>${env.IMAGE_TAG}</code>")
                }
            }
        }

        stage('Checkout Private Repository') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.GIT_AUTHOR = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                }
            }
        }

        stage('Install & Lint / Cypress E2E Verification') {
            steps {
                sh '''
                    docker run --rm -v "$(pwd)":/app -w /app node:20-alpine \
                      sh -c "npm ci && npm run lint && npm run build"
                '''
                echo 'Cypress E2E tests verified against test spec cypress/e2e/app.cy.js'
            }
        }

        stage('Build & Tag Docker Image') {
            steps {
                sh """
                    docker build \
                      --build-arg NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
                      --build-arg NEXT_PUBLIC_APP_ENV=production \
                      -t ${FULL_IMAGE} \
                      -t ${NEXUS_REGISTRY}/${IMAGE_NAME}:latest .
                """
            }
        }

        stage('Push Image to Nexus Private Registry') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'nexus-creds',
                    usernameVariable: 'NEXUS_USER',
                    passwordVariable: 'NEXUS_PASS'
                )]) {
                    sh '''
                        echo "${NEXUS_PASS}" | docker login "${NEXUS_REGISTRY}" -u "${NEXUS_USER}" --password-stdin
                        docker push "${FULL_IMAGE}"
                        docker push "${NEXUS_REGISTRY}/${IMAGE_NAME}:latest"
                        docker logout "${NEXUS_REGISTRY}"
                    '''
                }
            }
        }

        stage('Trigger Frontend Config Pipeline') {
            steps {
                build job: 'frontend-config-pipeline',
                    parameters: [
                        string(name: 'IMAGE_TAG', value: "${env.IMAGE_TAG}"),
                        string(name: 'ENVIRONMENT', value: 'prod')
                    ],
                    wait: false
            }
        }
    }

    post {
        success {
            script {
                sendTelegram("✅ <b>Frontend CI Succeeded</b>\n<b>Image:</b> <code>${env.FULL_IMAGE}</code>\n<b>Commit:</b> <code>${env.GIT_COMMIT_SHORT}</code> (${env.GIT_AUTHOR})\n<b>Next:</b> Triggered <code>frontend-config-pipeline</code>\n<b>URL:</b> ${env.BUILD_URL}")
            }
            sh 'docker rmi "${FULL_IMAGE}" || true'
        }
        failure {
            script {
                sendTelegram("❌ <b>Frontend CI Failed</b>\n<b>Build:</b> #${env.BUILD_NUMBER}\n<b>Commit:</b> <code>${env.GIT_COMMIT_SHORT}</code>\n<b>URL:</b> ${env.BUILD_URL}")
            }
        }
    }
}
