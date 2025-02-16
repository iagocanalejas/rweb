defmodule Service.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {
        Plug.Cowboy,
        scheme: :http, plug: RestApi.Router, options: [port: Application.get_env(:service, :port)]
      },
      {
        Postgrex,
        [
          name: :db_conn,
          hostname: Application.get_env(:service, :hostname),
          username: Application.get_env(:service, :username),
          password: Application.get_env(:service, :password),
          database: Application.get_env(:service, :database),
          port: Application.get_env(:service, :db_port),
          ssl: [cacerts: :public_key.cacerts_get()],
          pool_size: 10
        ]
      }
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Service.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
