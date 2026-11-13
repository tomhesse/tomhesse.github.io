{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShell {
  packages = with pkgs; [
    catppuccin-whiskers
    just
    python3
  ];
}
