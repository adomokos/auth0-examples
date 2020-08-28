mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(notdir $(patsubst %/,%,$(dir $(mkfile_path))))

repl: ## Run a REPL for development
	echo "TODO:"
.PHONY: repl

run: ## Run app locally
	poetry run python auth0_flask/server.py
.PHONY: run

.PHONY: test
test: ## Run the tests
	poetry run pytest

help: ## Prints this help message
	@grep -h -E '^[a-zA-Z0-9\._-]+:.*?## .*$$' $(MAKEFILE_LIST) |\
		sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
.DEFAULT_GOAL := help
