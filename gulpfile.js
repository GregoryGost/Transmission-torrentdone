'use strict';

import gulp from 'gulp';
import ts from 'gulp-typescript';
import uglify from 'gulp-uglify';
import clean from 'gulp-clean';

function cleanAll() {
  return gulp.src(['./dist/'], { read: false, allowEmpty: true }).pipe(clean());
}

function transpileTS() {
  const tsproject = ts.createProject('./tsconfig.json');
  return tsproject.src().pipe(tsproject()).pipe(uglify()).pipe(gulp.dest('./dist'));
}

const build = gulp.series(cleanAll, transpileTS);

export { build as default };
