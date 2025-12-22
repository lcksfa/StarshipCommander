// .pnpmfile.js
// Custom pnpm configuration for better compatibility

module.exports = {
  hooks: {
    // Custom hook to fix potential compatibility issues
    readPackage(pkg, context) {
      // Ensure peer dependencies are handled correctly
      if (pkg.name === '@nestjs/swagger') {
        // Override peer dependencies if needed
        if (pkg.peerDependencies) {
          Object.keys(pkg.peerDependencies).forEach((peer) => {
            if (peer.startsWith('@nestjs/')) {
              // Allow broader version range for NestJS packages
              pkg.peerDependencies[peer] = '^10.0.0 || ^11.0.0';
            }
          });
        }
      }
      return pkg;
    },

    // Custom hook for package lifecycle
    afterAllInstalled(lockfileDir) {
      console.log('✅ All packages installed successfully');
      console.log('📦 Using pnpm workspace configuration');
    },
  },
};
