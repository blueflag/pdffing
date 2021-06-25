#!/bin/sh
[ -z "$STAGE" ] && STAGE="dev"
DIR=`dirname $0`


echo $DIR/terraform/env-$STAGE
cd $DIR/terraform/env-$STAGE

if [ "$STAGE" != "dev" ]; then
    terraform init -no-color
    terraform workspace new $STAGE    
    terraform workspace select $STAGE
    echo $STAGE selected
fi
terraform init -no-color 
terraform apply -no-color -auto-approve -var stage=$STAGE
