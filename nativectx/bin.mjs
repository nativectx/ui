#!/usr/bin/env node
// Thin alias so `npx nativectx <command>` works without typing the scope.
//
// The real CLI reads process.argv directly and runs on import, so there is
// nothing to forward — argv is already correct when this file is the entry
// point. Keeping it an import (rather than spawning a child) means signals,
// exit codes and stdio pass through untouched.
import '@nativectx/ui/cli';
