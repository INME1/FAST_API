#!/bin/bash

# Django 프로젝트 생성
django-admin startproject config .
cd config
python manage.py startapp api

# settings.py 수정을 위한 백업
cp settings.py settings.py.backup

echo "Django project created! Now configure settings.py manually"
