# Justfiles are better Makefiles (Don't @ me)
# Install the `just` command from here https://github.com/casey/just
# https://cheatography.com/linux-china/cheat-sheets/justfile/

default:
  @just --list

clean:
  npx hardhat clean

compile:
  npx hardhat compile

build: clean compile

test: test-forge test-hh

# Working around this bug https://github.com/gakonst/foundry/issues/970
test-forge:
  #!/bin/bash
  mkdir contracts/test
  cp -r test/unit/* contracts/test
  forge test
  rm -rf contracts/test

test-hh:
  npx hardhat test


remix:
  remixd -s `pwd` --remix-ide https://remix.ethereum.org

verify:
  npx hardhat verifyall

runnode:
  npx hardhat node

deploy:
  npx hardhat deploy

# Generate Go code for contracts
gen:
  #!/bin/bash
  THATDIR=$PWD && cd $GOPATH/pkg/mod/github.com/ava-labs/coreth@v0.8.6 && cat $THATDIR/artifacts/contracts/Oracle.sol/Oracle.json | jq '.abi' | go run cmd/abigen/main.go --abi - --pkg oracle --out $THATDIR/gen/_oracle.go
  echo "Complete!"
