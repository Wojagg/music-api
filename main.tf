terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.72.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
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
