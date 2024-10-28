variable "S3_NAME" {
  type = string
}

variable "AWS_REGION" {
  type = string
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.72.0"
    }
  }
  backend "s3" {
    bucket = var.S3_NAME
    key    = "state/terraform.tfstate"
    region = var.AWS_REGION
  }
}

provider "aws" {
  region = var.AWS_REGION
}

resource "aws_instance" "ec2" {
  ami                  = "ami-0de02246788e4a354"
  instance_type        = "t2.micro"
  iam_instance_profile = "ec2ReadOnlyFromEcr"
  tags = {
    "Name" = "music-api"
  }
  availability_zone = "eu-central-1a"
}
