terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.72.0"
    }
  }
  backend "s3" {
    bucket = "bucket-name"
    key    = "state/terraform.tfstate"
    region = "aws-region"
  }
}

provider "aws" {
  region = var.AWS_REGION
}

resource "aws_instance" "ec2" {
  ami                    = "ami-00d72ec36cdfc8a0a"
  instance_type          = "t2.micro"
  iam_instance_profile   = "ec2ReadOnlyFromEcr"
  availability_zone      = "eu-central-1a"
  key_name               = "ubuntu-workstation"
  vpc_security_group_ids = [aws_security_group.music-api.id]
  tags = {
    "Name" = "music-api"
  }
}

data "aws_vpc" "default" {
  default = true
}

resource "aws_security_group" "music-api" {
  name        = "music-api"
  description = "Allow HTTPS, HTTP and SSH access"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTPS ingress"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["83.22.251.111/32"]
  }

  ingress {
    description = "HTTP ingress"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH ingress"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "instance_ip_addr" {
  value = aws_instance.ec2.public_ip
}

resource "aws_ecr_repository" "music-api-service" {
  name                 = "wojagg/music-api-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }
}

resource "aws_ecr_repository" "music-api-auth" {
  name                 = "wojagg/music-api-auth"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }
}

resource "aws_ecr_repository" "redis" {
  name                 = "wojagg/redis"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }
}
