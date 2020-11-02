### Ubuntu 18.04 ###

Install dependencies:
> sudo apt install python3 default-jre

### Windows ###

If someone uses Windows 10 with the Linux subsystem (which might have to be run as administrator, don't really know why, but python fails to copy some files without it), then the above steps for Ubuntu could be used here as well.

If not, then install things manually:
- Python 3	http://python.org/download/
- Java		https://www.java.com/en/download/manual.jsp


## To build the extension ##

> python3 build.py


## Notes ##

The build script will automatically download the following libraries:

- Closure compiler (for js) (see the exact version in the build.py, usually the latest)
	https://github.com/google/closure-compiler/wiki/Binary-Downloads

- htmlcompressor (for html)
	http://code.google.com/p/htmlcompressor/downloads/detail?name=htmlcompressor-1.5.3.jar

- yuicompressor 2.4.7 (for css)
	https://github.com/yui/yuicompressor/downloads


The packages I publish on AMO are built on Windows with the Linux Subsystem.

The zip file itself won't be identical to the uploaded version (some files were copied/touched, and probably their timestamps don't match).
So, the content of the two archives should be compared (with some diff tool).

Also the compressed HTML files may differ between Linux and Windows (as it seems that htmlcompressor respects line endings).
