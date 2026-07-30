# nativectx

CLI entry point for **[NativeCtx UI](https://nativectx.com)**.

This package exists so the CLI can be run without typing the scope:

```bash
npx nativectx skills     # install Claude Skills into .claude/skills/
npx nativectx mcp        # start the MCP server
npx nativectx migrate    # upgrade a project from zero-to-app
```

It contains no logic of its own — it depends on
[`@nativectx/ui`](https://www.npmjs.com/package/@nativectx/ui) and forwards to
the same CLI, so `npx @nativectx/ui <command>` is always equivalent.

**Installing the component library?** Use `@nativectx/ui`, not this package:

```bash
npx expo install @nativectx/ui
```

Documentation, components and theming: **[nativectx.com](https://nativectx.com)**

## License

MIT
