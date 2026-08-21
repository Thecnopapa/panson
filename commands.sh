
source $PROJECT_PATH/gcloud.sh
gcloud config set project panson

test (){
    local title="Local Server"
    if [[ "$*" == *"tunnel"* ]]; then
      echo " * Using Ngrok tunnel"
      export START_NGROK=1
      local title="$title --tunnel"
    else
      export START_NGROK=0
    fi

    if [[ "$*" == *"no-secrets"* ]]; then
      echo " * Not loading secrets"
      export SECRETS=0
    else
      export SECRETS=1
    fi

    if [[ "$*" == *"old-safari"* ]]; then
      echo " * Emulating old safari"
      export OLD_SAFARI=1
      local title="$title --old-safari"
    else
      export OLD_SAFARI=0
    fi

    if [[ "$*" == *"debug"* ]]; then
      echo " * Debug mode activated"
        local title="$title --debug"
        echo -en "\033]0;$title\a"
        flask --app main run --host="0.0.0.0" --port=8080 --debug
    else
        echo -en "\033]0;$title\a"
        flask --app main run --host="0.0.0.0" --port=8080
    fi



}
upload (){
  echo -en "\033]0;Cloud Upload\a"
  cd $PROJECT_PATH && gcloud storage cp -r ./static/* gs://panson.firebasestorage.app/
}

deploy (){
  echo -en "\033]0;Web Deploy\a"
  cd $PROJECT_PATH && gcloud run deploy test --source .
}

latest () {
  cd $PROJECT_PATH && gcloud run services update-traffic --to-latest
}
