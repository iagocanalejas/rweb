import Config

config :service, port: 80

config :service,
  username: System.get_env("DATABASE_USERNAME") || "postgres",
  password: System.get_env("DATABASE_PASSWORD") || "psql",
  database: System.get_env("DATABASE_NAME") || "postgres",
  hostname: System.get_env("DATABASE_HOST") || "postgres",
  db_port: String.to_integer(System.get_env("DB_PORT") || "5432"),
  pool_size: 10
