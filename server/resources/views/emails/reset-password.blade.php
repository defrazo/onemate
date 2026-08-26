<!doctype html>
<html lang="ru">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Сброс пароля</title>
	</head>
	<body
		style="
			margin: 0;
			padding: 24px;
			background-color: #121212;
			font-family: Inter, Arial, sans-serif;
			color: #ffffff;
		"
	>
		<div style="display: none; max-height: 0; overflow: hidden; opacity: 0">
			Запрос на сброс пароля в ToolBox. Если это были не вы – никаких действий не требуется.
		</div>
		<table width="100%" cellpadding="0" cellspacing="0" border="0">
			<tr>
				<td align="center">
					<table
						width="100%"
						cellpadding="0"
						cellspacing="0"
						border="0"
						style="
							max-width: 560px;
							background: #161717;
							border: 1px solid #fafafa12;
							border-radius: 28px;
							padding: 48px 40px;
						"
					>
						<tr>
							<td align="center" style="padding-bottom: 24px">
								<div style="font-size: 30px; font-weight: 700; letter-spacing: -0.04em; color: #ffffff">
									Tool<span style="color: #5b5cff">Box</span>
								</div>
							</td>
						</tr>
						<tr>
							<td style="border-top: 1px solid #fafafa12; padding-top: 24px"></td>
						</tr>
						<tr>
							<td
								align="center"
								style="
									padding-bottom: 16px;
									font-size: 32px;
									font-weight: 700;
									line-height: 1.2;
									letter-spacing: -0.03em;
									color: #ffffff;
								"
							>
								Сброс пароля
							</td>
						</tr>
						<tr>
							<td
								align="center"
								style="padding-bottom: 32px; font-size: 16px; line-height: 1.7; color: #98a2b3"
							>
								Мы получили запрос на сброс пароля для вашего аккаунта OneMate. Вы можете установить
								новый пароль по кнопке ниже.
							</td>
						</tr>
						<tr>
							<td align="center" style="padding-bottom: 24px">
								<a
									href="{{ $url }}"
									style="
										display: inline-block;
										background: #5b5cff;
										color: #ffffff;
										text-decoration: none;
										font-size: 15px;
										font-weight: 600;
										padding: 16px 28px;
										border-radius: 16px;
									"
								>
									Сбросить пароль
								</a>
							</td>
						</tr>
						<tr>
							<td
								align="center"
								style="padding-bottom: 12px; font-size: 14px; line-height: 1.6; color: #667085"
							>
								Ссылка для сброса пароля активна 60 минут.
							</td>
						</tr>
						<tr>
							<td
								align="center"
								style="padding-bottom: 32px; font-size: 14px; line-height: 1.6; color: #667085"
							>
								Если вы не запрашивали сброс пароля, никаких действий не требуется.
							</td>
						</tr>
						<tr>
							<td style="border-top: 1px solid #fafafa12; padding-top: 24px"></td>
						</tr>
						<tr>
							<td
								align="center"
								style="font-size: 13px; line-height: 1.7; color: #667085; word-break: break-word"
							>
								Если кнопка не работает, скопируйте и откройте ссылку в браузере:
								<br /><br />

								<a href="{{ $url }}" style="color: #5b5cff; text-decoration: none"> {{ $url }} </a>
							</td>
						</tr>
						<tr>
							<td align="center" style="padding-top: 32px; font-size: 12px; color: #475467">
								© {{ date('Y') }} ToolBox. Все права защищены.
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</body>
</html>
