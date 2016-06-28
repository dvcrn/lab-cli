# lab-cli

Very simple __WIP__ cli for gitlab.

This got created out of the need for a simple cli to interact with gitlab. I will gradually add more
features if I run into things that I personally need.

## Installation
```
npm install -g lab-cli
```

## Config
Create a `~/.labrc` file in the following format:
```
{
  "access_token": "123abc",
  "domain": "my.gitlab.com"
}
```

## Usage

```
lab

Usage:
    lab merge-request my/project base_branch=master source_branch title

more coming soon (maybe)

```


## License

MIT
