variable "aws_region" {
  type    = string
  default = "us-east-1"
}
variable "vpc_name" {
  type    = string
  default = "my-vpc"
}
variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}
variable "private_subnets" {
  default = {
    "private-subnet-01" = 1
    "private-subnet-02" = 2
    "private-subnet-03" = 3
  }
}
variable "public_subnets" {
  default = {
    "public-subnet-01" = 1
    "public-subnet-02" = 2
    "public-subnet-03" = 3
  }
}