import datetime
import random

from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.utils.decorators import method_decorator
import django.utils.timezone
from django.views import View
from django.views.generic import DetailView, ListView

import applications.models
from homepage.forms import AddCommentForm, ApplicationAdd

__all__ = []


class HomeView(ListView):
    template_name = "index.html"
    context_object_name = "routes"

    def get_queryset(self):
        current_date = django.utils.timezone.now()

        next_6_hours = current_date + datetime.timedelta(hours=6)

        hot_routes = list(
            applications.models.Application.objects.active()
            .filter(
                departure_time__range=(current_date, next_6_hours),
            )
            .values_list("id", flat=True),
        )
        try:
            chosen = random.sample(hot_routes, 5)
        except ValueError:
            chosen = hot_routes

        return applications.models.Application.objects.active().filter(
            id__in=chosen,
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["routes"] = self.get_queryset()
        return context


class ApplicationDetailView(DetailView):
    template_name = "homepage/application_detail.html"
    model = applications.models.Application
    context_object_name = "application"

    def get_queryset(self):
        pk = self.kwargs["pk"]
        return applications.models.Application.objects.active().filter(id=pk)

    @method_decorator(login_required)
    def post(self, request, *args, **kwargs):
        form = AddCommentForm(request.POST or None)
        pk = self.kwargs["pk"]
        if form.is_valid():

            text = form.cleaned_data.get("text")
            comment = form.save(commit=False)
            comment.user = request.user
            comment.text = text
            comment.application_id = pk
            comment.save()
        return redirect("homepage:application_detail", pk=pk)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form"] = AddCommentForm()
        context["comments"] = applications.models.Comment.objects.filter(
            application_id=context["application"],
        )
        return context


class ApplicationAddView(View):
    def get(self, request):
        if not request.user.profile.passport_verification:
            return redirect("users:profile")
        form = ApplicationAdd()
        return render(request, "homepage/applicationadd.html", {"form": form})

    def post(self, request, *args, **kwargs):
        if not request.user.profile.passport_verification:
            return redirect("users:profile")
        form = ApplicationAdd(request.POST)
        if form.is_valid():
            new_application = form.save(commit=False)
            new_application.user = request.user
            new_application.save()
            form.save()
            return redirect("users:profile")
        else:
            form = ApplicationAdd()
            return render(
                request,
                "homepage/applicationadd.html",
                {"form": form},
            )
