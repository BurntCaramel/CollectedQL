variable "cloudflare_email" {}
variable "cloudflare_token" {}

provider "cloudflare" {
  email = "${var.cloudflare_email}"
  token = "${var.cloudflare_token}"
}

resource "cloudflare_worker_script" "pipeline" {
  zone = "collected.systems"
  content = "${file("../build/piping.umd.js")}"
}

resource "cloudflare_worker_route" "collected-systems-pipeline" {
  zone = "collected.systems"
  pattern = "collected.systems/pipeline/*"
  enabled = true

  depends_on = ["cloudflare_worker_script.pipeline"]
}

resource "cloudflare_worker_route" "www-collected-systems-pipeline" {
  zone = "collected.systems"
  pattern = "www.collected.systems/pipeline/*"
  enabled = true

  depends_on = ["cloudflare_worker_script.pipeline"]
}
