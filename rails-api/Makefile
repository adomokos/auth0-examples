-include .env.$(or $(APP_ENV),development)
export

.PHONY: run
run: ## Runs the Rails app
	bundle exec rails s

.PHONY: authenticate
authenticate: ## Calls Auth0 to authenticate
	curl --request POST \
  --url https://dev-xelcri2d.us.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{"client_id":$(CLIENT_ID),"client_secret":$(CLIENT_SECRET),"audience":"https://rails-secure-api","grant_type":"client_credentials"}' | jq

.PHONY: check-bearer-token
check-bearer-token:
ifndef TOKEN
	$(error TOKEN is required)
endif

.PHONY: make-request
make-request: check-bearer-token ## Makes Authorized request
	curl --request GET \
		 --url http://path_to_your_api/ \
		 --header 'authorization: Bearer $(TOKEN)'

.PHONY: chirps
chirps: ## Call the index route on the API
	curl -H "Content-Type: application/json" \
		 -H "Authorization: bearer $(TOKEN)" \
		 GET http://localhost:3000/chirps

.PHONY: chirp
chirp: ## Get the first chirp
	curl -H "Content-Type: application/json" \
		 -H "Authorization: bearer $(TOKEN)" \
		 GET http://localhost:3000/chirps/3

.PHONY: add-chirp
add-chirp: check-bearer-token ## Adds a chirp to the app
	curl -H "Content-Type: application/json" \
		 -H "Authorization: bearer $(TOKEN)" \
		 -d '{"body": "this is my first chirp", "published": true}' -X POST http://localhost:3000/chirps

.PHONY: delete-chirp
delete-chirp: check-bearer-token ## Removes a chirp
	curl -H "Authorization: bearer $(TOKEN)" \
		 -X DELETE http://localhost:3000/chirps/3

.PHONY: help
help: ## Display this message
	@grep -h -E '^[a-zA-Z0-9\._-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
.DEFAULT_GOAL := help
