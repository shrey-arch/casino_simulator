pipeline {
    agent { label 'agent1' }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                bat 'echo Building project...'
                bat 'hostname'
            }
        }

        stage('Test') {
            steps {
                bat 'echo Running tests...'
            }
        }
    }
}
