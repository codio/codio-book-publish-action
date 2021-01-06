# Codio book publish action

Publishes book

# Usage

See [action.yml](action.yml)


```yaml
steps:

- uses: codio/codio-book-publish-action
  with:
    token: api-token
    book-id: my-book-id
    changelog: message
    zip: new_version.zip
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)