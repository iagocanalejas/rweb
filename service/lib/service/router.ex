defmodule RestApi.Router do
  use Plug.Router

  # Attach the Logger to log incoming requests 
  plug(Plug.Logger)

  # Tell Plug to match the incoming request with the defined endpoints
  plug(:match)

  # Once there is a match, parse the response body if the content-type
  # is application/json. The order is important here, as we only want to
  # parse the body if there is a matching route.(Using the Jayson parser)
  plug(Plug.Parsers,
    parsers: [:json],
    pass: ["application/json"],
    json_decoder: Jason
  )

  # Dispatch the connection to the matched handler
  plug(:dispatch)

  get "/" do
    case Postgrex.query(:db_conn, "SELECT * FROM league", []) do
      {:ok, result} ->
        send_resp(conn, 200, Jason.encode!(result.rows))

      {:error, error} ->
        send_resp(conn, 500, "Database Error: #{inspect(error)}")
    end
  end

  # Fallback handler when there was no match
  match _ do
    send_resp(conn, 404, "Not Found")
  end
end
