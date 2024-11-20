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
  ami                  = "ami-00d72ec36cdfc8a0a"
  instance_type        = "t2.micro"
  iam_instance_profile = "ec2ReadOnlyFromEcr"
  tags = {
    "Name" = "music-api"
  }
  availability_zone = "eu-central-1a"
}
