variable "cloudflare_email" {}
variable "cloudflare_token" {}

provider "cloudflare" {
  email = "${var.cloudflare_email}"
  token = "${var.cloudflare_token}"
}

resource "cloudflare_worker_script" "api1" {
  zone = "collected.systems"
  content = "${file("../build/collectedql-post-processed.umd.js")}"
}

resource "cloudflare_worker_route" "collected-systems-api1" {
  zone = "collected.systems"
  pattern = "collected.systems/1/*"
  enabled = true

  depends_on = ["cloudflare_worker_script.api1"]
}
